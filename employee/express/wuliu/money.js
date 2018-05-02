// express/wuliu/money.js
var QR = require('../../script/qrcode.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consignmentType: ['', '普通', '专线'],
    info: null
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      this.getMoney()
    })
  },

  getMoney: function () {
    wx.showLoading()
    app.post(app.config.exp.wuliuMoney, {
      distributionId: this.options.id,
      goodsCarIds: this.options.cars
    }).then(({data}) => {
      this.setData({ info: data })

      // 生成二维码
      QR.api.draw(data.payCode, 'qr-canvas', 150, 150)
      // setTimeout(_ => {
      //   wx.canvasToTempFilePath({
      //     canvasId: 'qr-canvas',
      //     success: res => {
      //       console.log(res.tempFilePath)
      //       this.setData({ imagePath: res.tempFilePath })
      //     }
      //   })
      // }, 1000)
    }).finally(_ => {
      wx.hideLoading()
    })
  }
})