// pages/car-bespeak/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyIndex: 0,
    buyTime: ['', '随车', '3天内', '7天内'],
    store: {
      visible: false,
      height: 602-200,
      slted: {},
      data: {
        rows: 20000,
        carId: '',
        colourId: '',
        latitude: '',
        longitude: '',
        isDistance: 1
      },
      list: []
    },
    formData: {
      carId: '',
      orgId: '',
      customerUsersName: '',
      phoneNumber: '',
      carPurchaseIntention: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          'store.height': res.windowHeight
        })
      }
    })

    app.onLogin(userInfo => {
      this.data.formData.carId = options.car
      this.data.store.data.carId = options.car
      this.data.store.data.colourId = options.color

      wx.getLocation({
        type: 'gcj02',
        success: function(res) {
          that.data.store.data.longitude = res.longitude
          that.data.store.data.latitude = res.latitude
          that.getInfo()
        },
        fail: function(res) {
          wx.showModal({
            title: '地理位置获取失败',
            content: res.errMsg,
            showCancel: false
          })
        }
      })
    })
  },
  getInfo() {
    wx.showLoading()
    app.post(app.config.bespeakBefor, this.data.store.data).then(({data}) => {
      this.setData({
        'formData.customerUsersName': data.customerUsersName,
        'formData.phoneNumber': data.phoneNumber,
        'store.slted': data.list.filter(item => item.isChooes === 1)[0],
        'store.list': data.list.map(item => {
          return item
        })
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  changeStore() {
    this.setData({
      'store.visible': true
    })
  },
  closeStore() {
    this.setData({
      'store.visible': false
    })
  }
})