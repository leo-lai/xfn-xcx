// shop/store/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('shop-store-info')
  },
  getInfo: function () {
    app.storage.getItem('shop-store-info').then(info => {
      if (info) {
        console.log(info)
        info.fullAddress = info.provinceName
        if (info.provinceName !== info.cityName) {
          info.fullAddress += info.cityName
        }
        info.fullAddress += info.areaName + info.address

        info.businessLicenseArr = info.businessLicense ? info.businessLicense.split(',') : []
        this.setData({ info })
      }
    })
  },
  previewImage: function (event) {
    let current = event.target.id
    let urls = event.currentTarget.dataset.urls
    wx.previewImage({
      current, urls
    })
  },
  pass: function (event) { // 审核门店
    let isPass = event.currentTarget.dataset.val
    wx.showLoading({ mask: true })
    app.post(app.config.shop.storeAudit, { 
      orgId: this.data.info.orgId,
      isPass
    }).then(_ => {
      app.storage.setItem('shop-store-list-refresh', 1)
      app.toast('审核成功', false).then(_ => {
        this.setData({
          'info.status': isPass == 0 ? 2 : 1
        })
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})