// pages/offer/index.js
const app = getApp()
const sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
Page({
  noopFn: app.noopFn,
  data: {
    topTips: '',
    rate: { // 首付比例
      index: -1,
      list: [
        { label: '10%', value: 10 },
        { label: '20%', value: 20 },
        { label: '30%', value: 30 },
        { label: '40%', value: 40 },
      ]
    },
    tabs: {
      tit: ['全款', '按揭'],
      index: 0,
      offset: 0,
      left: 0
    },
    info: {
      carName: '',
    },
    formData: {
      carId: '',
      type: '',               // 1全款，2按揭
      mode: 1,                // 1优惠，2加价
      change_price: '',
      total_fee: '0.00',      // 总费用
      monthly_supply: '0.00', // 每月还款

      price: '',
      bareCarPrice: '',
      purchase_tax: '',
      license_plate_priace: '',
      vehicle_vessel_tax: '',
      insurance_price: '',
      traffic_insurance_price: '',
      boutique_priace: '',
      quality_assurance: '',
      other: '',
      down_payment_rate: '',
      periods: '',
      annual_rate: '',
      mortgage: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    this.tabClick(0)
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
    let id = event.target.id
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      value = this.data[picker].list[value]
      if (app.utils.isObject(value)) {
        value = value.value
      }
    }

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)

    setTimeout(this.getTotal, 50)
  },
  // 选择车辆
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      this.setData({
        'formData.carId': carType.id,
        'info.carName': carType.name,
        'formData.price': carType.price
      })
      setTimeout(this.getTotal, 50)
    }
  },
  tabClick: function (event) {
    let index
    if (event && event.currentTarget) {
      index = Number(event.currentTarget.id)
      this.setData({
        'tabs.offset': event.currentTarget.offsetLeft,
        'tabs.index': event.currentTarget.id
      })
    } else {
      index = Number(event)
      let windowWidth = wx.getSystemInfoSync().windowWidth
      this.setData({
        'tabs.index': index,
        'tabs.left': (windowWidth / this.data.tabs.tit.length - sliderWidth) / 2,
        'tabs.offset': windowWidth / this.data.tabs.tit.length * index
      })
    }

    this.setData({
      'formData.type': index + 1
    })
  },
  getTotal: function () {
    let {
      type = 1, price = 0, bareCarPrice = 0, mode = 1, change_price = 0,
      purchase_tax = 0, license_plate_priace = 0, vehicle_vessel_tax = 0, 
      insurance_price = 0, traffic_insurance_price = 0,
      boutique_priace = 0, quality_assurance = 0, other = 0,
      down_payment_rate = 0, periods = 0, annual_rate = 0, mortgage = 0
    } = this.data.formData

    let total_fee = 0, monthly_supply = 0

    bareCarPrice = Number(price) || 0
    change_price = Number(change_price) || 0

    if (bareCarPrice > 0) {
      bareCarPrice = bareCarPrice + (mode == 1 ? -change_price : change_price)
    }
    total_fee += bareCarPrice
    total_fee += Number(purchase_tax)
    total_fee += Number(license_plate_priace)
    total_fee += Number(vehicle_vessel_tax)
    total_fee += Number(insurance_price)
    total_fee += Number(traffic_insurance_price)
    total_fee += Number(boutique_priace)
    total_fee += Number(quality_assurance)
    total_fee += Number(other)
    
    if(type == 2){
      total_fee += Number(mortgage)

      down_payment_rate = Number(down_payment_rate) || 100
      periods = Number(periods) || 0
      annual_rate = Number(annual_rate) || 0

      // 首付金额
      let down_payment_money = down_payment_money = total_fee * (down_payment_rate / 100)

      if (periods && annual_rate) {
        monthly_supply = (total_fee - down_payment_money) * (annual_rate / periods)
      }

      total_fee = down_payment_money
    }
    this.setData({
      'formData.bareCarPrice': bareCarPrice,
      'formData.total_fee': total_fee.toFixed(2),
      'formData.monthly_supply': monthly_supply.toFixed(2),
    })
  },

  submit: function () {
    if (!this.data.formData.carId) {
      this.showTopTips('请选择车型')
      return
    }

    if(this.data.formData.type == 2) {
      if (!this.data.formData.down_payment_rate) {
        this.showTopTips('请选择首付比例')
        return
      }
      if (!this.data.formData.periods) {
        this.showTopTips('请输入贷款期数')
        return
      }
      if (!this.data.formData.annual_rate) {
        this.showTopTips('请输入年利率')
        return
      }
    }

    wx.showLoading({ mask: true })
    app.post(app.config.offerPrice, this.data.formData).then(({ data }) => {
      app.navigateTo('info?id=' + data.id)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})