// pages/offer/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyWay: ['','全款','按揭'],
    info: null
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getInfo()
  },
  callPhone: function (event) {
    wx.makePhoneCall({ phoneNumber: event.currentTarget.dataset.val + '' })
  },
  getInfo: function () {
    wx.showLoading()
    app.ajax(app.config.offerInfo, {
      id: this.options.id
    }).then(({data}) => {
      this.setData({
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  onShareAppMessage: function() {
    return {
      title: this.data.info.user.username + '的报价单'
    }
  }
})