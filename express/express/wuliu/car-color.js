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
      wx.setNavigationBarTitle({
        title: this.options.type == 'neishi' ? '选择内饰颜色' : '选择车身颜色'
      })
      this.getColor(this.options.id)
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 获取颜色列表
  getColor: function (familyId = '') {
    wx.showLoading()
    let url = app.config.cheshen
    if (this.options.type == 'neishi') {
      url = app.config.neishi
    }
    app.post(url, { familyId }).then(({ data }) => {
      data = data.map(item => {
        let temp = {
          id: item.carColourId,
          name: item.carColourName
        }
        if (this.options.type == 'neishi') {
          temp.id = item.interiorId
          temp.name = item.interiorName
        }
        return temp
      })
      this.setData({ 
        slted: data.filter(item => item.id == this.options.cid)[0] || '',
        list: data 
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  slt: function (event) {
    let slted = this.data.list.filter(item => item.id == event.currentTarget.id)[0]
    if (slted) {
      this.setData(slted)
      slted.goodsCarId = this.options.gid
      slted.type = this.options.type
      app.getPrevPage().then(prevPage => {
        prevPage.carColorCb(slted)
        app.back()
      })
    }
  }
})