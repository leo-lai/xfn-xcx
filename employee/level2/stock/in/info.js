// level2/stock/in/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    carList: [],
    carSource: ['资源采购', '4S店出货'],
    contractImage: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({
      topTips
    })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({
        topTips: ''
      })
    }, 3000)
  },
  // 入库单详情
  getInfo: function () {
    wx.showNavigationBarLoading()
    app.post(app.config.stockInInfo, {
      storageId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'contractImage': data.stockStorage.contractImage ? data.stockStorage.contractImage.split(',') : [],
        'info': data.stockStorage,
        'carList': data.list
      })
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  // 查看车辆明细
  viewCar: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('stock-in-info-car', item)
    app.navigateTo('car?id=' + this.data.info.storageId)
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.contractImage // 需要预览的图片http链接列表
    })
  }
})