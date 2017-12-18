// pages/car-license/index.js
const app = getApp()
Page({

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
        carsSearch: ''
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

      // 获取搜索历史记录
      app.storage.getItem('stock_out_history').then(list => {
        this.setData({
          'filter.history': list || []
        })
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('stock_out_refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('stock_out_refresh')
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
    app.post(app.config.licenseList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      // data.list = data.list.map(item => {
      //   item.thumb = app.utils.formatThumb(item.indexImage, 150)
      //   return item
      // })

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


  // 搜索相关=================================================
  showFilter: function (event) {
    let filterType = event.currentTarget.dataset.val
    if (filterType === this.data.filter.type && filterType === 'brand') {
      this.hideFilter()
    } else {
      this.setData({
        'filter.visible': true,
        'filter.type': filterType
      })
    }
  },
  hideFilter: function (event) {
    this.setData({
      'filter.visible': false,
      'filter.type': ''
    })
  },
  // 品牌过滤
  filterSearch: function (event) {
    let item = event.currentTarget.dataset.item
    let data = {}
    switch (this.data.filter.type) {
      case 'brand':
        if (this.data.filter.sltedBrand.id !== item.id) {
          data['filter.sltedBrand'] = item
          data['filter.data.brandId'] = item.id
        } else {
          data['filter.sltedBrand'] = {}
          data['filter.data.brandId'] = ''
        }
        break
    }
    data['filter.data.carsSearch'] = ''
    this.setData(data)
    this.getList()
  },
  // 正在输入
  filterTyping(event) {
    if (event.detail.value === '') {
      this.setData({
        'list.ajax': false
      })
    }
    this.setData({
      'filter.data.carsSearch': event.detail.value
    })
  },
  // 清楚输入
  clearTyping() {
    this.setData({
      'filter.data.carsSearch': ''
    })
    this.search()
  },
  // 清除搜索历史记录
  clearHistory: function () {
    app.storage.removeItem('stock_out_history')
    this.setData({
      'filter.history': []
    })
  },
  // 历史搜索
  searchHistory: function (event) {
    this.setData({
      'filter.data.carsSearch': event.target.dataset.val
    })
    this.search()
  },
  // 搜索
  search: function () {
    // 本地记录搜索关键词
    if (this.data.filter.data.carsSearch.trim() && !this.data.filter.history.includes(this.data.filter.data.carsSearch)) {
      let historyData = this.data.filter.history.concat(this.data.filter.data.carsSearch)
      this.setData({
        'filter.history': historyData
      })
      app.storage.setItem('stock_out_history', historyData)
    }
    this.hideFilter()
    this.getList()
  }
})