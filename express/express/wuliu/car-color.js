// express/wuliu/car-color.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slted: {},
    list: []
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(_ => {
      this.getCheshen(this.options.id)
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 获取车身颜色列表
  getCheshen: function (familyId = '') {
    wx.showLoading()
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({ 
        slted: data.filter(item => item.carColourId == this.options.cid)[0],
        list: data 
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  slt: function (event) {
    let item = this.data.list.filter(item => item.carColourId == event.currentTarget.id)[0]
    this.setData({
      slted: item
    })

    if (item) {
      item.goodsCarId = this.options.gid
      app.getPrevPage().then(prevPage => {
        prevPage.chechenCb(item)
        app.back()
      })
    }
  }
})