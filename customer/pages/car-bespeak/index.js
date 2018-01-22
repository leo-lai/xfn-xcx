// pages/car-bespeak/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    buyIndex: -1,
    buyTime: ['3天内', '7天内'],
    store: {
      visible: false,
      height: 602 - 200,
      slted: {},
      data: {
        rows: 20000,
        carId: '',
        colourId: '',
        latitude: '',
        longitude: '',
        isDistance: 0
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
    wx.getSystemInfo({
      success: res => {
        this.setData({
          'store.height': res.windowHeight - 200
        })
      }
    })

    app.onLogin(userInfo => {
      this.$params = {
        ids: options.ids ? options.ids.split(',') : []
      }
      this.data.formData.carId = this.$params.ids[0] || ''
      this.data.store.data.carId = this.$params.ids[0] || ''
      this.data.store.data.colourId = this.$params.ids[1] || ''

      this.getLocation(_ => {
        this.getInfo()
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  getLocation(callback = app.noopFn) {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.data.store.data.longitude = res.longitude
        this.data.store.data.latitude = res.latitude
        callback()
      },
      fail: res => {
        wx.showModal({
          title: '授权失败',
          content: '小程序需要获取您的地理位置',
          confirmText: '开启定位',
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                success: res => {
                  if (res.authSetting['scope.userLocation']) {
                    this.getLocation(callback)
                  } else {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
            } else {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    })
  },
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.bespeakBefor, this.data.store.data).then(({ data }) => {
      if (!data) {
        wx.showModal({
          content: '当前没有可询价的门店',
          showCancel: false,
          success: res => {
            if(res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }else {
        let slted = data.list.filter(item => item.isChoice === 1)[0]
        if (!slted) {
          slted = data.list[0]
          slted.isChoice = 1
        }
        this.setData({
          'formData.customerUsersName': data.customerUsersName,
          'formData.phoneNumber': data.phoneNumber,
          'store.slted': slted,
          'store.list': data.list.map(item => {
            item.distanceStr = item.distance >= 1000 ? 
              ((item.distance / 1000).toFixed(1) + '公里') : (item.distance + '米')
            return item
          })
        })
      }
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  changeStore: function () {
    this.setData({
      'store.visible': true
    })
  },
  closeStore: function () {
    this.setData({
      'store.visible': false
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
  sltFilter: function (event) {
    this.setData({
      'store.data.isDistance': event.currentTarget.dataset.val
    })
    this.getInfo()
  },
  sltStore: function (event) {
    let slted = event.currentTarget.dataset.item
    let list = this.data.store.list.map(item => {
      if (item.orgId === slted.orgId) {
        item.isChoice = 1
      } else {
        item.isChoice = 0
      }
      return item
    })
    this.setData({
      'store.slted': slted,
      'store.list': list
    })
    this.closeStore()
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
  // 表单输入
  bindInput: function (event) {
    let data = {}
    data['formData.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  bindPicker: function (event) {
    this.setData({
      'buyIndex': event.detail.value,
      'formData.carPurchaseIntention': event.detail.value + 1
    })
  },
  askPrice: function() {
    if (!this.data.store.slted.orgId) {
      this.showTopTips('请选择预约门店')
      return
    }

    if (!this.data.formData.customerUsersName) {
      this.showTopTips('请输入姓名')
      return
    }

    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }

    if (!this.data.formData.carPurchaseIntention) {
      this.showTopTips('请选择购车时间')
      return
    }

    this.data.formData.orgId = this.data.store.slted.orgId
    wx.showLoading({ mask: true })
    app.post(app.config.bespeak, this.data.formData).then(({data}) => {
      wx.redirectTo({
        url: '../msg/index?type=1'
      })
    }).finally(_ => {
      wx.hideLoading()
    })

  }
})