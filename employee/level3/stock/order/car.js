// pages/car-stock-order-info/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    templateImage: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.storage.getItem('stock-order-info-car').then(info => {
      if (info) {
        this.setData({
          info,
          'templateImage': info.stockCarImages ? info.stockCarImages.split(',') : []
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('stock-order-info-car')
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.templateImage // 需要预览的图片http链接列表
    })
  }
})