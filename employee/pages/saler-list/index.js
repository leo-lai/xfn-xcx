// pages/saler-list/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.getSales()
    }, this.route)
  },

  // 获取销售顾问列表
  getSales: function () {
    wx.showLoading()
    app.post(app.config.salesList).then(({ data }) => {
      this.setData({
        'list': data.map(item => {
          item.checked = false
          return item
        })
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  sltOk: function (event) {
    let systemUserId = event.detail.value
    let slted = null
    this.setData({
      'list': this.data.list.map(item => {
        item.checked = item.systemUserId == systemUserId
        if (item.checked) slted = item
        return item
      })
    })
    app.getPrevPage().then(prevPage => {
      prevPage.onSalesChange && prevPage.onSalesChange(slted)
    })
    app.back()
  }
})