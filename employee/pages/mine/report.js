// pages/mine/report.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    queryDate: '2018-01'
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(userInfo => {
      let queryDate = new Date().format('yyyy-MM')
      this.setData({ queryDate })
      this.getInfo()
    })
  },
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.salerReport, {
      queryDate: this.data.queryDate
    }).then(({ data }) => {
      this.setData({
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  bindPicker: function (event) {
    this.setData({
      queryDate: event.detail.value
    })

    this.getInfo()
  }
})