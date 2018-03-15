// pages/customer-order/jing.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    slted: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
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
      'slted': value.join(',')
    })
  },
  submit: function () {
    app.getPrevPage().then(prevPage => {
      let _type = this.options.type
      if (_type == 1) {
        prevPage.setData({
          'carParts.list1': this.data.list,
          'orderInfo.followInformation': this.data.slted
        })
      } else if (_type == 2) {
        prevPage.setData({
          'carParts.list2': this.data.list,
          'orderInfo.boutiqueInformation': this.data.slted
        })
      }
      app.back()
    })
  }
})