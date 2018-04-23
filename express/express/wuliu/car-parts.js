// express/wuliu/car-parts.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.storage.getItem('load-car-parts').then(carParts => {
      if (carParts) {
        this.setData({
          index: carParts.index,
          list: app.config.baseData.incarParts.map((item, index) => {
            return {
              id: index + 1,
              checked: carParts.list.includes(item),
              name: item
            }
          })
        })
      }
    })
  },
  sltcarParts: function (event) {
    let value = event.detail.value
    let list = this.data.list.map(item => {
      item.checked = value.includes(item.name)
      return item
    })

    this.setData({
      'list': list
    })
  },
  submit: function () {
    app.getPrevPage().then(prevPage => {
      prevPage.onCarPartsCb && prevPage.onCarPartsCb({
        index: this.data.index,
        list: this.data.list.filter(item => item.checked).map(item => item.name)
      })
      app.back()
    })
  }
})