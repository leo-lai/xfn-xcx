// level2/order/contract.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
  },
  onShareAppMessage: function() {
    return {
      title: '购车电子合同'
    }
  },
  // 订购单详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.lv2.contract, {
      orderId: this.options.id
    }).then(({ data }) => {
      data.createTimeStr = app.utils.str2date(data.createTime).format('yyyy年MM月dd日')
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  }
})