// pages/car-bespeak/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    buyIndex: 0,
    buyTime: ['', '随车', '3天内', '7天内'],
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
        success: function (res) {
          that.data.store.data.longitude = res.longitude
          that.data.store.data.latitude = res.latitude
          that.getInfo()
        },
        fail: function (res) {
          wx.showModal({
            title: '地理位置获取失败',
            content: res.errMsg,
            showCancel: false
          })
        }
      })
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
            item.distance = (item.distance / 10000).toFixed(2)
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
  catchEvent: app.noop,
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
      'formData.carPurchaseIntention': event.detail.value
    })
  },
  askPrice: function() {
    if (!this.data.formData.customerUsersName) {
      this.showTopTips('请输入姓名')
      return
    }

    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }

    if (this.data.formData.carPurchaseIntention <= 0) {
      this.showTopTips('请选择购车时间')
      return
    }

    if (!this.data.store.slted.orgId) {
      this.showTopTips('请选择预约门店')
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