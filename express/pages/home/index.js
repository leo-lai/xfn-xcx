// pages/home/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: {
      banner: app.config.resURL + '/employee/index-banner.jpg'
    },
    userInfo: null
  },    

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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