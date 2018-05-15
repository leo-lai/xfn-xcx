// shop/menu.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(userInfo => {
      this.setData({ userInfo })
    })
  }
})