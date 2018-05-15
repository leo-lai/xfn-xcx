// pages/home/index2.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    month: '',
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(userInfo => {
      let month = new Date().format('yyyy-MM')
      this.setData({ userInfo, month })
      this.getInfo()
    })
  },
  // 获取统计数据信息
  getInfo() {
    app.ajax(app.config.index.data).then(({data}) => {
      if(data) {
        this.setData({
          commission: data.commission,
          consumer: data.consumer,
          customer: data.customer,
          intensityCount: data.intensityCount
        })
      }
    })
  },
})