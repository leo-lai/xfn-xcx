// pages/order-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowPage: 0,
    topTips: '',
    userInfo: {},
    phone: {
      visible: true,
      disabled: false,
      times: 0,
      image: app.config.resURL + '/20171208001.png',
      data: {
        phoneNumber: '',
        phoneCode: ''
      }
    },
    info: null,
    nonInfo: {
      image: app.config.resURL + '/20171208002.png',
    },
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
  onShow: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
      if (!userInfo.phoneNumber) {
        this.setData({
          'nowPage': 1
        })
        wx.setNavigationBarTitle({
          title: '绑定手机'
        })
      }else {
        this.getInfo()
      }
    })
  },
  getInfo: function() {
    wx.showLoading()
    app.post(app.config.orderInfo).then(({ data }) => {
      if (data) {
        this.setData({
          'nowPage': data.customerOrderState === 13 ? 4 : 3,
          'info': data
        })
        wx.setNavigationBarTitle({
          title: data.isAppointment === 1 ? '预约信息' : '订单跟踪'
        })
      }else {
        throw new Error('没有预约订单信息')
      }
    }).catch(_ => {
      this.setData({
        'nowPage': 2
      })
      wx.setNavigationBarTitle({
        title: '订单跟踪'
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
  },
  showBindPhone: function () {
    this.setData({
      'phone.visible': true
    })
  },
  closeBindPhone: function () {
    this.setData({
      'phone.visible': false
    })
  },
  // 表单输入
  bindInput: function (event) {
    let data = {}
    data['phone.data.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  getPhoneCode: function () {
    if(this.data.phone.times <= 0) {
      if (!this.data.phone.data.phoneNumber) {
        this.showTopTips('请输入手机号码')
        return
      }
      if (!/^1\d{10}$/.test(this.data.phone.data.phoneNumber)) {
        this.showTopTips('请输入正确的手机号码')
        return
      }

      let times = 10
      this.setData({
        'phone.times': times,
        'phone.disabled': true
      })

      this.data.phone.timeId = setInterval(_ => {
        if(times <= 0) {
          clearInterval(this.data.phone.timeId)
          this.setData({
            'phone.disabled': false,
            'phone.times': 0
          })
        }else {
          this.setData({
            'phone.times': --times
          })
        }
      }, 1000)

      app.post(app.config.phoneCode, {
        phoneNumber: this.data.phone.data.phoneNumber
      })
    }
  },
  bindPhone: function () {
    if (!this.data.phone.data.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }
    if (!/^1\d{10}$/.test(this.data.phone.data.phoneNumber)) {
      this.showTopTips('请输入正确的手机号码')
      return
    }
    if (!this.data.phone.data.phoneCode) {
      this.showTopTips('请输入验证码')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.bindPhone, this.data.phone.data).then(({data}) => {
      app.updateUserInfo(data)
      this.setData({
        'phone.visible': false
      })
      this.getInfo()
    }).finally(_ => {
      wx.hideLoading()
    })
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
  }
})