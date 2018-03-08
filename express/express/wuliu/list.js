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
        let ids = []
        let tuoyunList = {}
        item.goodsCars.forEach(carItem => {
          ids.push(carItem.goodsCarId)
          let {
            consignmentId,
            consignmentCode, 
            startingPointAddress, 
            destinationAddress
          } = carItem.consignmentVo
          let { costsAmount } = carItem.carCostsVo
          if (tuoyunList[consignmentCode]) {
            tuoyunList[consignmentCode].amount += costsAmount
            tuoyunList[consignmentCode].carList.push(carItem)
          }else {
            tuoyunList[consignmentCode] = {
              consignmentId: consignmentId,
              consignmentCode: consignmentCode,
              startingPointAddress: startingPointAddress,
              destinationAddress: destinationAddress,
              amount: costsAmount,
              carList: [carItem]
            }
          }
        })
        item.ids = ids.join(',')
        item.tuoyunList = tuoyunList
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
  jiedan: function (event) {
    let distributionId = event.currentTarget.id
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuJie, { distributionId }).then(_ => {
      app.toast('接单成功').then(_ => {
        this.getList()
      })
    }).finally(_ => {
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