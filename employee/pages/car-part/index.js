// pages/car-part/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    noopFn: app.noopFn,
    userInfo: null,
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
      this.setData({ userInfo })
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.checkLogin().then(_ => {
        app.storage.getItem('car_part_done').then(refresh => {
          if (refresh) {
            app.storage.removeItem('car_part_done')
            this.getList()
          }
        })
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
  // 品牌列表
  getBrandList: function () {
    app.post(app.config.brandList).then(({ data }) => {
      this.setData({
        'brandList': data
      })
    })
  },
  // 待出库列表
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
    app.post(app.config.carPartList, {
      page, ...this.data.filter.data
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
  // 表单输入
  dateInput: function (event) {
    let data = {}
    data['filter.data.' + event.target.id] = event.detail.value
    this.setData(data)
    this.getList()
  },
  dateChange: function (event) {
    let slted = event.currentTarget.dataset.item
    slted.estimateDate = event.detail.value
    wx.showLoading()
    app.post(app.config.estimateDate, {
      customerOrderId: slted.customerOrderId,
      estimateDate: slted.estimateDate
    }).then(_ => {
      app.toast('操作成功')
      // this.setData({ 'list.data': this.data.list.data })
      this.setData({
        'list.data': this.data.list.data.map(item => {
          if (slted.customerOrderId === item.customerOrderId) {
            item.estimateDate = slted.estimateDate
          }
          return item
        })
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})