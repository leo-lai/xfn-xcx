// pages/car-stock-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    info: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })

      this.params = {
        ids: options.ids ? options.ids.split(',') : ['', '', '']
      }
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 库存详情
  getInfo: function() {
    wx.showLoading()
    app.post(app.config.carStockInfo, {
      carsId: this.params.ids[0],
      colourId: this.params.ids[1],
      interiorId: this.params.ids[2],
      rows: 1000
    }).then(({data}) => {
      data.guidingPriceStr = (data.guidingPrice / 10000).toFixed(2) + '万'
      this.setData({
        'info': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 查看验车照片
  viewImages: function (event) {
    wx.previewImage({
      urls: event.currentTarget.dataset.item.stockCarImages.split(',')
    })
  }
})