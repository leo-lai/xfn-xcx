// share/sucai/list.js
const app = getApp()
const sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
Page({
  noopFn: app.noopFn,
  data: {
    tabs: {
      tit: ['已上架素材', '已下架素材'],
      index: 0,
      offset: 0,
      left: 0
    },
    filter: {
      loading: false,
      visible: false,
      data: {
        overShelf: 1,
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
      this.setData({ userInfo })
      this.tabClick(0)
    }, this.route)
  },
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('share-sucai-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('share-sucai-list-refresh')
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
  // 素材列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.share.sucaiList, {
      page, ...this.data.filter.data,
      rows: this.data.list.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.imageArr = item.image ? item.image.split(',') : []
        item.thumb = app.utils.formatThumb(item.imageArr[0], 150)
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
  tabClick: function (event) {
    let index
    if (event && event.currentTarget) {
      index = Number(event.currentTarget.id)
      this.setData({
        'tabs.offset': event.currentTarget.offsetLeft,
        'tabs.index': event.currentTarget.id
      })
    } else {
      index = Number(event)
      let windowWidth = wx.getSystemInfoSync().windowWidth
      this.setData({
        'tabs.index': index,
        'tabs.left': (windowWidth / this.data.tabs.tit.length - sliderWidth) / 2,
        'tabs.offset': windowWidth / this.data.tabs.tit.length * index
      })
    }

    let overShelf = 1

    switch (index) {
      case 0:
        overShelf = 1 // 上架
        break
      case 1:
        overShelf = 0 // 下架
        break
    }

    this.setData({
      'filter.data.overShelf': overShelf
    })
    this.getList(1)
  },
  // 上架下架
  upOff: function (event) {
    let overShelf = event.currentTarget.dataset.val
    let materialId = event.currentTarget.id
    wx.showLoading()
    app.post(app.config.share.sucaiUpOff, {
      materialId, overShelf
    }).then(_ => {
      app.toast(overShelf == 1 ? '上架成功' : '下架成功').then(_ => {
        this.getList(1)
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