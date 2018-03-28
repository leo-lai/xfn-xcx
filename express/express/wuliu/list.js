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
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('exp-wuliu-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('exp-wuliu-list-refresh')
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

    return app.post(app.config.wuliuList, {
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
        let cars = []
        let tempObj = {}
        let tuoyunList = []
        item.goodsCars.forEach(carItem => {
          cars.push(carItem.goodsCarId)
          let {
            consignmentId,
            consignmentCode, 
            startingPointAddress,
            startingPointLatitude,
            startingPointLongitude,
            destinationAddress,
            destinationLatitude,
            destinationLongitude,
            appointmentTimeDate
          } = carItem.consignmentVo
          let { costsAmount } = carItem.carCostsVo

          if (tempObj[consignmentCode] >= 0) {
            tuoyunList[tempObj[consignmentCode]].amount += costsAmount
            tuoyunList[tempObj[consignmentCode]].carList.push(carItem)
          }else {
            tuoyunList.push({
              consignmentId,
              consignmentCode,
              startingPointAddress,
              startingPointLatitude,
              startingPointLongitude,
              destinationAddress,
              destinationLatitude,
              destinationLongitude,
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
  // 接单
  jiedan: function (event) {
    let distributionId = event.currentTarget.id
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuJie, { distributionId }).then(_ => {
      app.toast('接单成功').then(_ => {
        this.getList()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  // 更改订单状态
  changeState: function (event) {
    let distributionId = event.currentTarget.id
    let state = event.target.dataset.state
    let msg = '操作成功'

    switch(state) {
      case '3':
        msg = '装车成功'
        break
    }
    
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuState, {
      distributionId, state
    }).then(_ => {
      app.toast(msg).then(_ => {
        this.getList()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },

  // 到达目的地
  arrival: function (event) {
    let ids = event.currentTarget.dataset.ids
        ids = ids ? ids.split(',') : []
    let distributionId = ids[0] || ''
    let consignmentId = ids[1] || ''

    wx.showLoading({ mask: true })
    app.post(app.config.wuliuArrival, {
      distributionId, consignmentId
    }).then(_ => {
      app.toast('操作成功').then(_ => {
        this.getList()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },

  // 导航
  openLocation: function (event) {
    let {name, lng, lat} = event.currentTarget.dataset
    wx.openLocation({
      latitude: lat * 1,
      longitude: lng * 1,
      name: '导航目的地',
      address: name
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