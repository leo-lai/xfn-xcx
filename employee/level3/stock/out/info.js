// level3/stock/out/info.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    orderType: app.config.baseData.orderType,
    info: null,
    carList: {
      visible: false,
      height: 602 - 200,
      loading: false,
      slted: [],
      list: [],
      data: {
        customerOrderId: '',
        stockCarId: ''
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      wx.getSystemInfo({
        success: res => {
          this.setData({
            'carList.height': res.windowHeight - 200
          })
        }
      })
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({
      topTips
    })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({
        topTips: ''
      })
    }, 3000)
  },
  // 库存详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.stockOutInfo, {
      customerOrderId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'info': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 可出库车辆列表
  getCarList: function () {
    wx.showNavigationBarLoading()
    app.post(app.config.stockOutCarList, {
      customerOrderId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'carList.visible': true,
        'carList.list': data.list.map(item => {
          item.checked = false
          return item
        })
      })
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  sltCarList: function (event) {
    this.setData({
      'carList.slted': event.detail.value
    })
  },
  closeCarList: function () {
    this.setData({
      'carList.visible': false
    })
  },
  // gotoOrder: function () { // 没库存，去订车
  //   app.storage.setItem('car-stock-order-info', this.data.info)
  //   app.navigateTo('../car-stock-order-add/index')
  // },
  outStockOk: function () {
    if (this.data.carList.slted.length === 0) {
      this.showTopTips('请选择要出库的车辆')
      return
    }

    if (this.data.carList.slted.length > this.data.info.number) {
      this.showTopTips('出库车辆不能大于订车数量')
      return
    }

    this.setData({ 'carList.loading': true })
    app.post(app.config.stockOutCar, {
      customerOrderId: this.options.id,
      stockCarId: this.data.carList.slted.join(',')
    }).then(_ => {
      app.getPrevPage().then(prevPage => prevPage.getList())
      app.toast('出库成功', true)
    }).finally(_ => {
      this.setData({ 'carList.loading': true })
    })
  }
})