// level3/customer/list2.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    buyWay: app.config.baseData.buyWay,
    filter: {
      type: '',
      loading: false,
      data: {
        keywords: '',
        type: 'all'
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
      this.setData({
        'filter.data.type': this.options.tp || 'all',
      })
      let title = ''
      switch (this.options.tp) {
        case 'intensity':
          title = '重点客户'
          break
        case 'visit':
          title = '今天预计到店客户'
          break
        default:
          title = '新增预约客户'
      }
      if (this.options.inf == 'visit'){
        title = '今日回访'
      }
      wx.setNavigationBarTitle({ title })
      setTimeout(this.getList, 50)
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv3-customer-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('lv3-customer-list-refresh')
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
  callPhone: function (event) {
    wx.makePhoneCall({ phoneNumber: event.currentTarget.dataset.val })
  },
  // 客户列表
  getList: function (page = 1, callback = app.noopFn) {
    let rows = this.data.list.rows || 10
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    let url = app.config.customer.list
    if (this.options.inf == 'visit') {
      url = app.config.customer.visitList
    }

    return app.ajax(url, {
      page, rows,
      ...this.data.filter.data
    }).then(({ data }) => {
      // 兼容非分页返回
      data = data || []
      if (!data.list && data.length >= 0) {
       // rows = 10000
        data = {
          total: data.length,
          list: data
        }
      }

      data.list = data.list.map(item => {
        item.thumb = item.headPortrait ? app.utils.formatHead(item.headPortrait) : app.config.avatar
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