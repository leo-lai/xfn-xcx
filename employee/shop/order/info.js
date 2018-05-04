// shop/order/info.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    expectBuyWay: ['', '全款', '贷款'],
    expectPayWay: ['', '线上支付', '到店支付'],
    topTips: '',
    info: null,
    carInfo: null,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(userInfo => {
      this.setData({ userInfo })
      this.getInfo()
    })
  },
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.shop.orderInfo, {
      advanceOrderId: this.options.id
    }).then(({ data }) => {
      let carInfo = data.orderInfoVos[0] || {}
      carInfo.thumb = app.utils.formatThumb(carInfo.image, 100, 100)
      carInfo.guidingPriceStr = (carInfo.guidingPrice / 10000).toFixed(2)
      carInfo.saleingPrice = carInfo.bareCarPriceOnLine

      this.setData({
        carInfo,
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  createOrder: function () {
    app.storage.setItem('shop-order-info', this.data.info)
    if (this.data.info.userType === 2) {
      app.navigateTo('/level2/order/add?aid=' + this.data.info.advanceOrderId)
    }else{
      app.navigateTo('/level3/customer/order?aid=' + this.data.info.advanceOrderId)
    }
  },
  viewInfo: function () {
    if (this.data.info.userType === 2) {
      app.navigateTo('/level2/order/info?id=' + this.data.info.realOrderId)
    }else{
      app.navigateTo('/level3/customer/order?ids=,' + this.data.info.realOrderId)
    }
  }
})