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
    this.timeid = setInterval(_ => {
      this.getGPS()
    }, 10000)
    this.getGPS()
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
    app.post(app.config.exp.wuliuGPS, {
      distributionId: this.options.id
    }).then(({ data }) => {
      if (data.longitude && data.latitude) {
        wx.setNavigationBarTitle({ title: '板车当前位置' })
        this.setData({
          'map.lng': data.longitude,
          'map.lat': data.latitude
        })
      }else {
        clearInterval(this.timeid)
        wx.setNavigationBarTitle({ title: '获取板车位置失败' })
      }
    }).catch(_ => {
      wx.setNavigationBarTitle({ title: '获取板车位置失败' })
      clearInterval(this.timeid)
    })
  }
})