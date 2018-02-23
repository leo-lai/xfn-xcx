// level3/stock/order/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    wuliu: ['随车', '物流'],
    templateImage: [],
    followInformation: [],
    carTime: app.config.baseData.carTime
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
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
    wx.showNavigationBarLoading()
    app.post(app.config.stockOrderInfo, {
      stockOrderId: this.options.id
    }).then(({ data }) => {
      data.guidingPriceStr = (data.guidingPrice / 10000).toFixed(2) + '万'
      this.setData({
        'templateImage': data.templateImage ? data.templateImage.split(',') : [],
        'followInformation': data.followInformation ? data.followInformation.split(',') : [],
        'info': data
      })
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  cancelOrder: function () {
    wx.showLoading()
    app.post(app.config.stockOrderCancel, {
      stockOrderId: this.data.info.stockOrderId
    }).then(_ => {
      app.getPrevPage().then(prevPage => {
        prevPage.getList()
      })
      app.toast('取消成功', true)
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  signOrder: function () { // 签收入库
    wx.showLoading()
    app.post(app.config.stockOrderSign, {
      stockOrderId: this.data.info.stockOrderId
    }).then(_ => {
      app.getPrevPage().then(prevPage => {
        prevPage.getList()
      })
      app.toast('签收成功', true)
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 查看车源明细
  viewCar: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('stock-order-info-car', item)
    app.navigateTo('car')
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.templateImage // 需要预览的图片http链接列表
    })
  }
})