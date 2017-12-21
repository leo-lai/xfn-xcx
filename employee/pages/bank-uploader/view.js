const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    uploadImages: [],
    uploadVideo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      app.storage.getItem('bankInfo').then(bankInfo => {
        if(bankInfo) {
          this.setData({
            'uploadImages': bankInfo.bankAuditsImage ? bankInfo.bankAuditsImage.split(',') : [],
            'uploadVideo': bankInfo.bankAuditsvideo
          })
        }
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.uploadImages // 需要预览的图片http链接列表
    })
  }
})