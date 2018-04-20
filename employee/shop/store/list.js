// shop/store/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  data: {
    storeStatus: ['审核通过', '审核不通过', '审核中'],
    statusClass: ['l-text-green', 'l-text-error', 'l-text-theme'],
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: ''
      }
    },
    slted: null,
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
      this.setData({
        slted: { goodsCarsId: this.options.id }
      })
      this.getList()
    }, this.route)
  },
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('shop-store-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('shop-store-list-refresh')
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
  // 门店列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.shop.storeList, {
      page, ...this.data.filter.data,
      rows: this.data.list.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.imageArr = item.imageUrl ? item.imageUrl.split(',') : []
        item.thumb = app.utils.formatThumb(item.imageArr[0], 150, 150)
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
  viewInfo: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('shop-store-info', item)
    app.navigateTo('info?id=' + item.orgId)
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