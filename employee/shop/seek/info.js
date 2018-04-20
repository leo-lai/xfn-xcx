// shop/seek/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: ['申请中', '已通过', '已拒绝'],
    info: null,
    storeInfo: null
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
    app.storage.removeItem('shop-seek-info')
  },
  getInfo: function () {
    app.storage.getItem('shop-seek-info').then(info => {
      if (info) {
        console.log(info)
        info.guidancePriceStr = (info.guidancePrice / 10000).toFixed(2)

        this.setData({ info })
      }
    })

    // app.post(app.config.shop.seekInfo, { findTheCarId: this.options.id })
  },
  previewImage: function (event) {
    let current = event.target.id
    let urls = event.currentTarget.dataset.urls
    wx.previewImage({
      current, urls
    })
  }
})