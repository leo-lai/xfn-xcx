// level2/order/ticket.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-order-ticket').then(info => {
      if (info) {
        info.checkCarPicArr = info.checkCarPic ? info.checkCarPic.split(',') : []
        info.ticketPicArr = info.ticketPic ? info.ticketPic.split(',') : []
        info.certificationPicArr = info.certificationPic ? info.certificationPic.split(',') : []
        info.tciPicArr = info.tciPic ? info.tciPic.split(',') : []
        info.ciPicArr = info.ciPic ? info.ciPic.split(',') : []
        info.expressPicArr = info.expressPic ? info.expressPic.split(',') : []
        info.otherPicArr = info.otherPic ? info.otherPic.split(',') : []
        console.log(info)
        this.setData({ info })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  onUnload: function () {
    app.storage.removeItem('lv2-order-ticket')
  },
  previewImage: function (event) {
    let name = event.currentTarget.dataset.name
    let imgs = this.data.info[name]
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    })
  }
})