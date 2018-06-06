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
    wx.showLoading({ mask: true })
    app.post(app.config.stockInInfo, {
      storageId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'contractImage': data.stockStorage.contractImage ? data.stockStorage.contractImage.split(',') : [],
        'info': data.stockStorage,
        'carList': data.list
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 查看车辆明细
  viewCar: function (event) {
    let item = event.currentTarget.dataset.item
    let edit = this.data.info.overSure != 1 ? 1 : 0
    app.storage.setItem('stock-in-info-car', item)
    app.navigateTo(`car?id=${this.data.info.storageId}&edit=${edit}`)
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.contractImage // 需要预览的图片http链接列表
    })
  },
  // 删除入库单
  del: function (event) {
    wx.showModal({
      content: '是否确定删除该入库单？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.stockInDel, {
            storageId: event.currentTarget.id
          }).then(_ => {
            wx.hideLoading()
            app.toast('删除成功', true).then(_ => {
              app.getPrevPage().then(prevPage => {
                prevPage.getList && prevPage.getList()
              })
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  // 确认全部已入库
  sure: function (event) {
    wx.showModal({
      title: '确定全部车辆入库提示',
      content: '请仔细检查入库车辆信息是否正确，确定后将不可再更改，是否确定？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.stockInSure, {
            storageId: event.currentTarget.id
          }).then(_ => {
            wx.hideLoading()
            app.toast('全部入库成功', true).then(_ => {
              app.getPrevPage().then(prevPage => {
                prevPage.getList && prevPage.getList()
              })
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
})