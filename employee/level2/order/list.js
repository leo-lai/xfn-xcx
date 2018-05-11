// level2/order/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'list', // slt
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: '',
        state: ''
      }
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({ 
        userInfo,
        'filter.data.state': this.options.sta || '',
        'isAdmin': userInfo.roleName == '仓管主管',
        'showEdit': userInfo.roleName != '仓管主管'
      })

      setTimeout(this.getList, 50)
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv2-order-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('lv2-order-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (app.globalData.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })

    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 订单列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    let url = this.data.isAdmin ? app.config.lv2.orderList2 : app.config.lv2.orderList
    return app.post(url, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      // 兼容非分页返回
      if (!data.list && data.length >= 0) {
        data = {
          rows: 10000,
          page: 1,
          total: data.length,
          list: data
        }
      }

      data.list.forEach(item => {
        // countermandApply 是否退款中
        // 37 已退款
        item.showEdit = this.data.showEdit && !item.countermandApply && item.state != 37
        item.infos.forEach(cars => {
          cars.changePrice2 = Math.abs(cars.changePrice)
          cars.auditNum = 0 // 待审核车辆
          cars.cars && cars.cars.forEach(frame => {
            if (frame.auditState == 5) {
              cars.auditNum += 1
            }
          })
        })
      })

      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  },
  // 配车/验车
  carMatch: function (event) {
    let carItem = event.currentTarget.dataset.item
    let index = event.currentTarget.dataset.index
    let item = this.data.list.data[index]
    carItem.orderState = item.state
    app.storage.setItem('lv2-order-car-info', carItem)
    app.navigateTo('car-match?edit=' + (item.showEdit ? 1 : 0))
  },
  // 配车/验车完成
  carMatchOk: function (event) {
    let orderId = event.currentTarget.dataset.val
    let state = event.target.dataset.state
    let content = ''
    let msg = ''

    if(!state) return
    switch(state) {
      case '15':
        content = '配车完成后，将不可再配车，是否确定？'
        msg = '配车已完成'
        break
      case '35':
        content = '验车完成后，车辆信息将不可再更改，是否确定？'
        msg = '验车已完成'
        break
    }
    wx.showModal({
      title: '确认提示',
      content,
      success: res => {
        if(res.confirm) {
          wx.showLoading()
          app.post(app.config.lv2.orderState, {
            orderId, state
          }).then(_ => {
            app.toast(msg, false).finally(_ => {
              this.getList()
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  // 出库
  outCar: function (event) {
    let item = this.data.list.data[event.currentTarget.dataset.index]
    // 如果物流方式是其他
    if (item.logisticsType == 2 && !(item.logisticsOrderCode && item.logisticsCompany && item.logisticsPlateNumber && item.logisticsDriver && item.logisticsDriverPhone)) {
      let formData = app.utils.copyObj({
        orderId: item.id,
        logisticsOrderCode: '',
        logisticsCompany: '',
        logisticsPlateNumber: '',
        logisticsDriver: '',
        logisticsDriverPhone: ''
      }, item)
      wx.showModal({
        content: '订单物流信息不全，请先完善物流信息',
        showCancel: false,
        success: res => {
          app.storage.setItem('lv2-order-wuliu', formData)
          app.navigateTo('wuliu')
        }
      })
    }else{
      wx.showModal({
        title: '确认提示',
        content: '出库前是核实是否收齐尾款，是否确定？',
        success: res => {
          if (res.confirm) {
            wx.showLoading()
            app.post(app.config.lv2.orderState, {
              orderId: item.id,
              state: 45
            }).then(_ => {
              app.toast('出库成功', false).finally(_ => {
                this.getList()
              })
            }).catch(_ => {
              wx.hideLoading()
            })
          }
        }
      })
    }
  },
  // 取消
  cancel: function (event) {
    wx.showModal({
      content: '是否确定取消该订购单？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.lv2.orderCancel, {
            id: event.currentTarget.id
          }).then(_ => {
            app.toast('取消成功').then(_ => {
              this.getList()
            })
          }).finally(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  // 搜索相关=================================================
  // 正在输入
  filterTyping(event) {
    event.detail.value === '' && this.setData({ 'list.ajax': false })
    this.setData({ 'filter.data.keywords': event.detail.value })
    clearTimeout(this.typingId)
    this.typingId = setTimeout(this.search, 1000)
  },
  // 清楚输入
  clearTyping() {
    this.setData({ 'filter.data.keywords': '' })
    this.search()
  },
  // 搜索
  search: function () {
    clearTimeout(this.typingId)
    wx.showLoading()
    this.getList().finally(_ => {
      wx.hideLoading()
    })
  }
})