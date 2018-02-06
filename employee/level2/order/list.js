// level2/order/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'list', // slt
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
  onReady: function () {
    app.onLogin(userInfo => {
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv2-order-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('lv2-order-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  onReachBottom: function () {
    if (this.data.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })

    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 订单列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.lv2.orderList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      // 如果接口返回的是数组，则转换成分页对象
      if (!data.list && data.length >= 0) {
        data = {
          page: 1,
          rows: data.length + 1,
          total: data.length,
          list: data
        }
      }
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
  // 配车/验车完成
  sureCar: function (event) {
    let orderId = event.currentTarget.dataset.val
    let state = event.currentTarget.dataset.state
    let content = state == 15 ? '配车完成后，将不可再配车，是否确定？' : '验车完成后，车辆信息将不可再更改，是否确定？'
    wx.showModal({
      title: '确认提示',
      content,
      success: res => {
        if(res.confirm) {
          wx.showLoading()
          app.post(app.config.lv2.orderState, {
            orderId, state
          }).then(_ => {
            app.toast(state == 15 ? '配车已完成' : '验车已完成', false).finally(_ => {
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