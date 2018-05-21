// pages/school/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  data: {
    resURL: app.config.resURL,
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
  // 分享列表
  getList: function (page = 1, callback = app.noopFn) {
    let rows = this.data.list.rows
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.ajax(app.config.school.list, {
      page, rows
    }).then(({ data }) => {
      // 兼容非分页返回
      data = data || []
      if (!data.list && data.length >= 0) {
        data = {
          total: data.length,
          list: data
        }
      }

      data.list = data.list.map(item => {
        item.thumb = app.utils.formatThumb(item.icon, 150)
        return item
      })

      this.setData({
        'list.more': data.list.length >= rows,
        'list.page': page,
        'list.data': page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  }
})