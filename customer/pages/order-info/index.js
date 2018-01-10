// pages/order-info/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    nowPage: 0,
    topTips: '',
    userInfo: null,
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
      '1': '待交定金',
      '3': '等待银行审核',
      '4': '银行审核不通过',
      '5': '等待车辆出库',
      '7': '等待加装精品',
      '9': '等待上牌',
      '11': '等待贴膜',
      '13': '等待交付车辆',
      '15': '客户已提车',
      '17': '已交车完毕'
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
  onLoad: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
      if (!userInfo.phoneNumber) {
        this.setData({ 'nowPage': 1 })
        wx.setNavigationBarTitle({ title: '绑定手机' })
      } else {
        this.getInfo()
      }
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  getInfo: function() {
    wx.showNavigationBarLoading()
    app.post(app.config.orderInfo).then(({ data }) => {
      if (data) {
        this.setData({
          'nowPage': data.customerOrderState === 17 ? 4 : 3,
          'info': data
        })
        
        if (data.customerOrderState >= 1 && data.customerOrderState < 17) {
          this.showTrack()
        }
        
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
      wx.hideNavigationBarLoading()
    })
  },
  showTrack: function() {
    wx.showNavigationBarLoading()
    app.post(app.config.orderTrack, { customerOrderId: this.data.info.customerOrderId })
      .then(({data}) => {
        let trackData = ['开单', '落定', '贷款审批', '车辆出库', '加装', '上牌', '贴膜', '提车', '交车']
        this.setData({
          // 'track.visible': true,
          'track.data': trackData.map((item, index) => {
            let _item = data[index]
            if (_item) {
              item = {
                title: item,
                content: _item.trackContent,
                time: _item.createDate,
                image: _item.image ? _item.image.split(',') : [],
                done: true
              }
            } else {
              item = {
                title: item,
                content: '',
                time: '',
                image: [],
                done: false
              }
            }
            return item
          })
        })
      }).finally(_ => {
        wx.hideNavigationBarLoading()
      })
  },
  closeTrack: function() {
    this.setData({
      'track.visible': false
    })
  },
  previewTrack: function(event) {
    
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

      let times = 60
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
      app.updateUserInfo(data, false)
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