// shop/online/list.js
const app = getApp()
const sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
Page({
  noopFn: app.noopFn,
  data: {
    topTips: '',
    tabs: {
      tit: ['已上架活动', '已下架活动'],
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
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          'tabs.left': (res.windowWidth / that.data.tabs.tit.length - sliderWidth) / 2,
          'tabs.offset': res.windowWidth / that.data.tabs.tit.length * that.data.tabs.index
        })
      }
    })
  },
  onReady: function () {
    app.onLogin(userInfo => {
      this.getList1()
    }, this.route)
  },
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('shop-active-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('shop-active-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      if(this.data.tabs.index == 1) {
        this.getList2(this.data.list2.data.length > 0 ? this.data.list2.page + 1 : 1)
      }else{
        this.getList1(this.data.list1.data.length > 0 ? this.data.list1.page + 1 : 1)
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (app.globalData.userInfo) {
      if (this.data.tabs.index == 1) {
        this.getList2(1, _ => {
          wx.stopPullDownRefresh()
        })
      } else {
        this.getList1(1, _ => {
          wx.stopPullDownRefresh()
        })
      }
    } else {
      wx.stopPullDownRefresh()
    }
  },
  edit: function(event) { // 编辑商品
    let item = event.currentTarget.dataset.item
    let formData = app.utils.copyObj({
      goodsCarsActivityId: '',
      goodsCarsId: '',
      carsId: '',
      carsName: '',
      guidingPrice: '',
      colourId: '',
      colourName: '',
      interiorId: '',
      interiorName: '',
      saleingNumber: '',
      onlineDis: 1,          // 线上优惠or加价
      discountPriceOnLine: '',
      underLineDis: 1,       // 线下优惠or加价
      discountPriceUnderLine: '',
      overInsurance: 1,
      bareCarPriceOnLine: '',
      depositPrice: '',
      bareCarPriceUnderLine: '',
      invoicePrice: '',
      provinceId: '',
      provinceName: '',
      cityId: '',
      cityName: '',
      areaId: '',
      areaName: '',
      warehouseId: '',
      logisticsCycle: '',
      logisticsPrice: '',
      invoiceCycle: '',
      dateOfManufacture: '',
      remarks: '',
      carsImage: '',
      carsImages: '',
      activityPrice: '',
    }, item)

    app.storage.setItem('shop-active-info', formData)
    app.navigateTo('add')
  },
  upOff: function (event) { // 上架下架
    let overOffShelf = event.currentTarget.dataset.val
    let goodsCarsActivityId = event.currentTarget.id
    wx.showLoading()
    app.post(app.config.shop.activeUpOff, { 
      goodsCarsActivityId, overOffShelf
    }).then(_ => {
      app.toast(overOffShelf == 1 ? '下架成功' : '上架成功').then(_ => {
        this.getList2()
        this.getList1()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  tabClick: function (event) {
    this.setData({
      'tabs.offset': event.currentTarget.offsetLeft,
      'tabs.index': event.currentTarget.id
    })

    if (event.currentTarget.id == 1) {
      this.data.list2.data.length === 0 && this.getList2()
    }else {
      this.data.list1.data.length === 0 && this.getList1()
    }
  },
  // 活动列表-上架
  getList1: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list1.more': true })

    if (!this.data.list1.more || this.data.list1.loading) {
      callback(this.data.list1.data)
      return
    }
    this.setData({ 'list1.loading': true })
    return app.post(app.config.shop.activeList, {
      page, ...this.data.filter.data,
      overOffShelf: 0,
      rows: this.data.list1.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.saleingPriceStr = item.bareCarPriceOnLine ? (item.bareCarPriceOnLine/10000).toFixed(2) : '0.00'
        item.guidingPriceStr = item.guidingPrice ? (item.guidingPrice/10000).toFixed(2) : '0.00'
        item.thumb = app.utils.formatThumb(item.image, 150)
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
  // 活动列表-下架
  getList2: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list2.more': true })

    if (!this.data.list2.more || this.data.list2.loading) {
      callback(this.data.list2.data)
      return
    }
    this.setData({ 'list2.loading': true })
    return app.post(app.config.shop.activeList, {
      page, ...this.data.filter.data,
      overOffShelf: 1,
      rows: this.data.list2.rows
    }).then(({ data }) => {
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
    if (this.data.tabs.index == 1) {
      this.getList2().finally(_ => {
        wx.hideLoading()
      })
    } else {
      this.getList1().finally(_ => {
        wx.hideLoading()
      })
    }
  }
})