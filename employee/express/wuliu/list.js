// express/tuoyun/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: ''
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      this.setData({
        userInfo,
        'auditor': userInfo.roleName.indexOf('资源主管') !== -1,
      })
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('exp-tuoyun-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('exp-tuoyun-list-refresh')
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
  // 板车列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    return app.post(app.config.exp.wuliuList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      data.list.forEach(item => {
        let cars = []
        let tempObj = {}
        let tuoyunList = []
        item.goodsCars.forEach(carItem => {
          cars.push(carItem.goodsCarId)
          let {
            consignmentId,
            consignmentCode,
            startingPointAddress,
            destinationAddress,
            appointmentTimeDate
          } = carItem.consignmentVo
          let { costsAmount } = carItem.carCostsVo

          if (tempObj[consignmentCode] >= 0) {
            tuoyunList[tempObj[consignmentCode]].amount += costsAmount
            tuoyunList[tempObj[consignmentCode]].carList.push(carItem)
          } else {
            tuoyunList.push({
              consignmentId,
              consignmentCode,
              startingPointAddress,
              destinationAddress,
              appointmentTimeDate,
              goodsCarState: carItem.goodsCarState,
              amount: costsAmount,
              carList: [carItem]
            })
            tempObj[consignmentCode] = tuoyunList.length - 1
          }
        })
        item.cars = cars.join(',')
        item.tuoyunList = tuoyunList.map(tuoyunItem => {
          tuoyunItem.cars = tuoyunItem.carList.map(carItem => carItem.goodsCarId).join(',')
          return tuoyunItem
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
  // 派单
  paidan: function (event) {
    let distributionId = event.currentTarget.id
    wx.showModal({
      content: '派单后物流单信息不可再更改，请确定物流单信息是否正确？',
      confirmText: '确定派单',
      success: res => {
        if(res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.exp.wuliuPai, { distributionId }).then(_ => {
            wx.hideLoading()
            app.toast('派单成功').then(_ => {
              this.getList()
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  // 更改订单状态
  changeState: function (event) {
    let distributionId = event.currentTarget.id
    let state = event.target.dataset.state
    let msg = '操作成功'

    switch (state) {
      case '3':
        msg = '装车成功'
        break
    }

    wx.showLoading({ mask: true })
    app.post(app.config.exp.wuliuState, {
      distributionId, state
    }).then(_ => {
      wx.hideLoading()
      app.toast(msg).then(_ => {
        this.getList()
      })
    }).catch(_ => {
      wx.hideLoading()
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