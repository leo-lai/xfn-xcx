// shop/order/info.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    expectBuyWay: ['', '全款', '贷款'],
    expectPayWay: ['', '线上支付', '到店支付'],
    topTips: '',
    info: null,
    carInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
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
    this.setData({ topTips })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({ topTips: '' })
    }, 3000)
  },
  // 表单输入
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      switch (id) {
        case 'colourId':
          value = this.data[picker].list[value].carColourId
          break
        case 'interiorId':
        case 'systemUserId':
          value = this.data[picker].list[value][id]
          break
        case 'loanBank':
          value = this.data[picker].list[value].id
          break
        default:
          value = this.data[picker].list[value]
          if (app.utils.isObject(value)) {
            value = value.name
          }
          break
      }
    }

    // 计算订单金额
    switch (id) {
      case 'loan':
        value = Math.min(this.data.orderPay, value)
        data['orderInfo.downPayments'] = this.data.orderPay - value
        break
      case 'carUnitPrice':
      case 'purchaseTaxPriace':
      case 'licensePlatePriace':
      case 'insurancePriace':
      case 'mortgagePriace':
      case 'boutiquePriace':
      case 'vehicleAndVesselTax':
        // 校验输入格式保留两位小数点

        clearTimeout(this.timeid)
        this.timeid = setTimeout(() => {
          this.getOrderPay()
        }, 200)
        break
    }

    console.log(id, value)

    data['orderInfo.' + id] = value
    this.setData(data)
  },
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.shop.orderInfo, {
      advanceOrderId: this.options.id
    }).then(({ data }) => {
      let carInfo = data.orderInfoVos[0] || {}
      carInfo.thumb = app.utils.formatThumb(carInfo.image, 100, 100)
      carInfo.guidingPriceStr = (carInfo.guidingPrice / 10000).toFixed(2)
      carInfo.saleingPrice = carInfo.bareCarPriceOnLine

      this.setData({
        carInfo,
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  createOrder: function () {
    if (this.data.info.userType == 2) {
      app.storage.setItem('shop-order-info', this.data.info)
      app.navigateTo('/level2/order/add?aid=' + this.data.info.advanceOrderId)
    }
  },
  viewInfo: function () {
    if (this.data.info.userType == 2) {
      app.navigateTo('/level2/order/info?id=' + this.data.info.realOrderId)
    }
  }
})