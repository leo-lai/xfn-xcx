// shop/seek/list.js
const app = getApp()
const sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
Page({
  noopFn: app.noopFn,
  data: {
    state: ['申请中', '已通过', '已拒绝'],
    stateClass: ['l-text-theme', 'l-text-green', 'l-text-error'],
    tabs: {
      tit: ['全部寻车', '我已报价'],
      index: 0,
      offset: 0,
      left: 0
    },
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: ''
      }
    },
    list1: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      rows: 50,
      data: []
    },
    list2: {
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
      this.tabClick(0)
    }, this.route)
  },
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('shop-seek-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('shop-seek-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      if (this.data.tabs.index == 1) {
        this.getList2(this.data.list2.data.length > 0 ? this.data.list2.page + 1 : 1)
      } else {
        this.getList1(this.data.list1.data.length > 0 ? this.data.list1.page + 1 : 1)
      }
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
  // 全部寻价
  getList1: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list1.more': true })

    if (!this.data.list1.more || this.data.list1.loading) {
      callback(this.data.list1.data)
      return
    }
    this.setData({ 'list1.loading': true })
    return app.post(app.config.shop.seekList, {
      page, ...this.data.filter.data,
      rows: this.data.list1.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.thumb = app.utils.formatThumb(item.image, 100, 100)
        item.guidancePriceStr = (item.guidancePrice / 10000).toFixed(2)
        return item
      })
      this.setData({
        'list1.more': data.list.length >= data.rows,
        'list1.page': data.page,
        'list1.data': data.page === 1 ? data.list : this.data.list1.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list1.loading': false })
      callback(this.data.list1.data)
    })
  },
  // 我已报价
  getList2: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list2.more': true })

    if (!this.data.list2.more || this.data.list2.loading) {
      callback(this.data.list2.data)
      return
    }
    this.setData({ 'list2.loading': true })
    return app.post(app.config.shop.mySeekList, {
      page, ...this.data.filter.data,
      rows: this.data.list2.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.shopFindCar.thumb = app.utils.formatThumb(item.shopFindCar.image, 100, 100)
        item.shopFindCar.guidancePriceStr = (item.shopFindCar.guidancePrice / 10000).toFixed(2)
        return item
      })
      this.setData({
        'list2.more': data.list.length >= data.rows,
        'list2.page': data.page,
        'list2.data': data.page === 1 ? data.list : this.data.list2.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list2.loading': false })
      callback(this.data.list2.data)
    })
  },
  getList: function () {
    let getList = this.data.tabs.index == 1 ? this.getList2 : this.getList1
    return getList.apply(this, arguments)
  },
  tabClick: function (event) {
    let index
    if (event && event.currentTarget) {
      index = event.currentTarget.id
      this.setData({
        'tabs.offset': event.currentTarget.offsetLeft,
        'tabs.index': event.currentTarget.id
      })
    } else {
      index = event
      let windowWidth = wx.getSystemInfoSync().windowWidth
      this.setData({
        'tabs.index': index,
        'tabs.left': (windowWidth / this.data.tabs.tit.length - sliderWidth) / 2,
        'tabs.offset': windowWidth / this.data.tabs.tit.length * index
      })
    }

    if (index == 1) {
      this.data.list2.data.length === 0 && this.getList2()
    } else {
      this.data.list1.data.length === 0 && this.getList1()
    }
  },
  viewInfo: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('shop-seek-info', item)
    app.navigateTo('info?id=' + (item.findCarOfferId || item.findTheCarId))
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