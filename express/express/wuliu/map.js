// express/wuliu/map.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map: {
      lng: 113.324520,
      lat: 23.099994,
      scale: 16
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getGPS()
    this.timeid = setInterval(_ => {
      this.getGPS()
    }, 10000)
  },
  onHide: function () {
    clearInterval(this.timeid)
  },
  onUnload: function () {
    clearInterval(this.timeid)
  },
  getGPS: function () {
    wx.setNavigationBarTitle({
      title: '正在获取板车位置'
    })
    app.post(app.config.wuliuGPS, {
      distributionId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'map.lng': data.longitude,
        'map.lat': data.latitude
      })
    }).finally(_ => {
      wx.setNavigationBarTitle({
        title: '板车当前位置'
      })
    })
  }
})