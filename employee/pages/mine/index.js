// pages/user/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  logout: function() {
    wx.showModal({
      content: '是否确定退出登录',
      success: res => {
        if(res.confirm) {
          app.logout()
        }
      }
    })
  }
})