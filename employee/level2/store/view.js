// level2/customer/view.js
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
  onShow: function () {
    app.storage.getItem('lv2-customer-info').then(info => {
      if(info) {
        info.regionName = info.provinceName === info.cityName ? (info.provinceName + info.areaName) : (info.provinceName + info.cityName + info.areaName)
        this.setData({ info })
      }
    })
  },
  onUnload: function () {
    app.storage.removeItem('lv2-customer-info')
  }
})