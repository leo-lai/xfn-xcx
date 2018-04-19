// shop/order/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
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
      rows: 50,
      data: []
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getList()
    }, this.route)
  },
  onShow: function () {
    app.checkLogin()
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      this.getList(this.data.list1.data.length > 0 ? this.data.list1.page + 1 : 1)
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
  // 商品列表-上架
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.shop.orderList, {
      page, ...this.data.filter.data,
      rows: this.data.list.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.saleingPriceStr = item.bareCarPriceOnLine ? (item.bareCarPriceOnLine / 10000).toFixed(2) : '0.00'
        item.guidingPriceStr = item.guidingPrice ? (item.guidingPrice / 10000).toFixed(2) : '0.00'
        item.thumb = app.utils.formatThumb(item.image, 150, 150)
        return item
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