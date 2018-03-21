// level2/stock/in/list.js
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
  // 待出库列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    this.data.filter.data.storageCode = this.data.filter.data.keywords
    return app.post(app.config.stockInList, {
            page, ...this.data.filter.data
          }).then(({ data }) => {
            data.list = data.list.map(item => {
              item.thumb = app.utils.formatThumb(item.indexImage, 150)
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

  // 删除入库单
  del: function (event) {
    wx.showModal({
      content: '是否确定删除该入库单？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.stockInDel, {
            storageId: event.currentTarget.id
          }).then(_ => {
            wx.hideLoading()
            app.toast('删除成功').then(_ => {
              this.getList()
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  // 确认全部已入库
  sure: function (event) {
    wx.showModal({
      title: '确定全部车辆入库提示',
      content: '请仔细检查入库车辆信息是否正确，确定后将不可再更改，是否确定？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.stockInSure, {
            storageId: event.currentTarget.id
          }).then(_ => {
            wx.hideLoading()
            app.toast('全部入库成功').then(_ => {
              this.getList()
            })
          }).catch(_ => {
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