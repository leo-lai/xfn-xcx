// share/share/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      this.getInfo()
    })
  },

  getInfo: function () {
    wx.showLoading()
    app.post(app.config.share.shareInfo, {
      materialInfoId: this.options.id
    }).then(({ data }) => {
      data.imageArr = data.materialVo.image ? data.materialVo.image.split(',') : []
      data.imageArr = data.imageArr.concat(data.image ? data.image.split(',') : [])
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  previewImage: function (event) {
    let urls = event.currentTarget.dataset.urls
    let current = event.target.id
    wx.previewImage({
      current, urls
    })
  }
})