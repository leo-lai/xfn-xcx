// pages/customer-order/jing.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    followInformation: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.storage.getItem('customer_order_jing').then(list => {
      this.setData({ list })
    })
  },
  sltcarParts: function (event) {
    let value = event.detail.value
    let list = this.data.list.map(item => {
      item.checked = value.includes(item.name)
      return item
    })

    this.setData({
      'list': list,
      'followInformation': value.join(',')
    })
  },
  submit: function () {
    app.getPrevPage().then(prevPage => {
      prevPage.setData({
        'carParts.list': this.data.list,
        'orderInfo.followInformation': this.data.followInformation
      })
      app.back()
    })
  }
})