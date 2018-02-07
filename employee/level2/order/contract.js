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
      this.setData({
        userInfo,
        'isAdmin': userInfo.roleName == '仓管主管',
        'showEdit': userInfo.roleName != '仓管主管' && userInfo.orgLevel == 2
      })
      this.getInfo()
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onShareAppMessage: function() {
    return {
      title: '购车电子合同'
    }
  },
  // 订购单详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.lv2.orderInfo, {
      orderId: this.options.id
    }).then(({ data }) => {
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  }
})