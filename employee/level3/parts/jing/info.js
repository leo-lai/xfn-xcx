// level3/parts/jing/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    overline: ['未过线检车', '已过线检查'],
    info: null,
    parts: [],
    parts2: []
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
  getInfo: function () {
    wx.showNavigationBarLoading()
    app.post(app.config.carPartInfo, {
      customerOrderId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'info': data,
        'parts': data.followInformation ? data.followInformation.split(',') : [],
        'parts2': data.boutiqueInformation ? data.boutiqueInformation.split(',') : []
      })
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  finish: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.carPartDone, {
      customerOrderId: this.options.id
    }).then(_ => {
      app.getPrevPage().then(prevPage => prevPage.getList())
      app.storage.setItem('lv3-order-list-refresh', 1)
      app.toast('加装完成', true)
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})