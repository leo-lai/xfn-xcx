// pages/school/info.js
const app = getApp()
var WxParse = require('../../template/wxParse/wxParse.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    content: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // app.checkLogin()
  },
  onShareAppMessage: function() {
    return {
      title: this.data.info.title
    }
  },

  getInfo: function() {
    wx.showLoading()
    app.ajax(app.config.school.info, {
      id: this.options.id
    }).then(({data}) => {
      this.setData({ info: data })

      WxParse.wxParse('content', 'html', data.content || '', this, 5)
    }).finally(_ => {
      wx.hideLoading()
    })
  }
})