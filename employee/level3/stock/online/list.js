// level3/stock/online/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    filter: {
      type: '',
      loading: false,
      visible: false,
      history: [],
      typeText: ['下架', '在售'],
      sltedType: { value: '', name: '全部', checked: true },
      typeList: [
        { value: '', name: '全部', checked: true },
        { value: '1', name: '在售', checked: false },
        { value: '0', name: '下架', checked: false }
      ],
      data: {
        isOnLine: '',
        carsName: ''
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

      // 获取搜索历史记录
      app.storage.getItem('car_stock_history').then(list => {
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
  // 库存列表
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
    this.setData({ 'list.loading': true })
    app.post(app.config.carOnlineList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.thumb = app.utils.formatThumb(item.indexImage, 150, 150)
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


  // 搜索相关=================================================
  showFilter: function (event) {
    let filterType = event.currentTarget.dataset.val
    if (filterType === this.data.filter.type && filterType === 'online') {
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
  // 是否在售
  filterSearch: function (event) {
    let value = event.detail.value
    let list = this.data.filter.typeList
    let data = {}
    data['filter.typeList'] = list.map(item => {
      if (item.value === value) {
        item.checked = true
        data['filter.sltedType'] = item
      } else {
        item.checked = false
      }
      return item
    })
    data['filter.data.isOnLine'] = value
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
      'filter.data.carsName': event.detail.value
    })
  },
  // 清楚输入
  clearTyping() {
    this.setData({
      'filter.data.carsName': ''
    })
    this.search()
  },
  // 清除搜索历史记录
  clearHistory: function () {
    app.storage.removeItem('car_stock_history')
    this.setData({
      'filter.history': []
    })
  },
  // 历史搜索
  searchHistory: function (event) {
    this.setData({
      'filter.data.carsName': event.target.dataset.val
    })
    this.search()
  },
  // 搜索
  search: function () {
    // 本地记录搜索关键词
    if (this.data.filter.data.carsName.trim() && !this.data.filter.history.includes(this.data.filter.data.carsName)) {
      let historyData = this.data.filter.history.concat(this.data.filter.data.carsName)
      this.setData({
        'filter.history': historyData
      })
      app.storage.setItem('car_stock_history', historyData)
    }
    this.hideFilter()
    this.getList()
  }
})