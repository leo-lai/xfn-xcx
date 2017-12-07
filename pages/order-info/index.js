// pages/order-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    info: {},
    state: {
      '1': '已提交定车单',
      '3': '已支付定金',
      '5': '银行贷款审批通过',
      '7': '车辆已出库',
      '9': '已交付尾款',
      '11': '加装／上牌完成'
    },
    track: {
      icons: [
        app.config.resURL + '/20171207001.jpg',
        app.config.resURL + '/20171207002.jpg',
        app.config.resURL + '/20171207003.jpg',
        app.config.resURL + '/20171207004.jpg',
        app.config.resURL + '/20171207005.jpg',
        app.config.resURL + '/20171207006.jpg',
        app.config.resURL + '/20171207007.jpg'
      ],
      visible: false,
      data: null
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })

      this.getInfo()
    })
  },
  getInfo: function() {
    wx.showLoading()
    app.post(app.config.orderInfo).then(({ data }) => {
      this.setData({
        'info': data
      })
      wx.setNavigationBarTitle({
        title: data.isAppointment === 1 ? '预约详情' : '订单详情'
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  showTrack: function() {
    wx.showLoading()
    app.post(app.config.orderTrack, { customerOrderId: this.data.info.customerOrderId })
      .then(({data}) => {
        this.setData({
          'track.visible': true,
          'track.data': data
        })
      }).finally(_ => {
        wx.hideLoading()
      })
  },
  closeTrack() {
    this.setData({
      'track.visible': false
    })
  },
  callPhone: function (event) {
    wx.makePhoneCall({ phoneNumber: event.currentTarget.dataset.val })
  },
  openMap: function (event) {
    wx.openLocation({
      latitude: event.currentTarget.dataset.lat,
      longitude: event.currentTarget.dataset.lng,
    })
  }
})