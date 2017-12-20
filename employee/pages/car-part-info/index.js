// pages/car-part-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    parts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
      this.params = {
        id: options.id
      }
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().finally(_ => {
      app.storage.setItem('current_page', this.route)
    })
  },
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.carPartInfo, {
      customerOrderId: this.params.id
    }).then(({data}) => {

      this.setData({
        'parts': data.followInformation ? data.followInformation.split(',') : [],
        'info': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  finish: function () {
    wx.showLoading()
    app.post(app.config.carPartDone, {
      customerOrderId: this.params.id
    }).then(_ => {
      app.storage.setItem('car_part_done', 1)
      app.toast('加装完成', true)
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})