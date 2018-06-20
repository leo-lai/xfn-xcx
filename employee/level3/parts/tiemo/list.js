// level3/parts/tiemo/list.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    overline: ['未过线检车', '已过线检查'],
    filter: {
      type: '',
      loading: false,
      visible: false,
      history: [],
      data: {
        startDate: '',
        endDate: ''
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
  // 待上牌列表
  getList: function (page = 1, callback = app.noopFn) {
    if (page === 1) {
      this.setData({
        'list.more': true
      })
    }
    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({
      'list.loading': true
    })
    app.ajax(app.config.customer.partList, {
      state: 11, page,
      ...this.data.filter.data
    }).then(({ data }) => {
      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({
        'list.loading': false
      })
      callback(this.data.list.data)
    })
  },
  // picker change
  dateChange: function (event) {
    let data = {}
    data['filter.data.' + event.target.id] = event.detail.value
    this.setData(data)
    this.getList()
  },
  finish: function (event) {
    let item = event.currentTarget.dataset.item
    wx.showLoading()
    app.post(app.config.tiemoDone, {
      customerOrderId: item.customerOrderId
    }).then(_ => {
      this.getList()
      app.toast('操作成功')
      app.storage.setItem('lv3-order-list-refresh', 1)
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})