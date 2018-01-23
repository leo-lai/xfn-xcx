// pages/car-stock-in-info/parst.js
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
    app.storage.getItem('stock-add-car-parts').then(list => {
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
        'formData.followInformation': this.data.followInformation
      })
      app.back()
    })
  }
})