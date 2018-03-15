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
   * 生命周期函数--监听页面初次渲染完成
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
    app.storage.setItem('exp-wuliu-list-refresh', 1)
    app.checkLogin()
  },
  previewImage: function () {
    let item = this.data.userInfo
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [item.idcardPicOn, item.idcardPicOff]
    })
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