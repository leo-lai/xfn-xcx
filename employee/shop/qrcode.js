// shop/qrcode.js
var QR = require('../script/qrcode.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: ''
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onReady: function () {
    let url = app.config.shopURL + '/?sc=' + this.options.sc

    this.setData({
      qrcode: url
    })
    QR.api.draw(url, 'qr-canvas', 200, 200)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '扫一扫进入我的商城',
      path: '/shop/qrcode?sc=' + this.options.sc
    }
  }
})