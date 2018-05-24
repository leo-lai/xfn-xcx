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
      total_fee: '0',      // 总费用
      monthly_supply: '0', // 每月还款

      price: '',
      bareCarPrice: '',
      purchase_tax: '',
      license_plate_priace: '',
      vehicle_vessel_tax: '',
      traffic_insurance_price: '',  // 交强险
      insurance_price: '',          // 商业险
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

    switch (id) {
      case 'mode':
      case 'change_price':
        setTimeout(this.getCost)
        break
    }
    setTimeout(this.getTotal, 50)
  },
  // 选择车辆
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      this.setData({
        'formData.carId': carType.id,
        'info.carName': carType.name,
        'formData.price': carType.price,
        'formData.license_plate_priace': '500',
        'formData.vehicle_vessel_tax': '420',
        'formData.traffic_insurance_price': '950',
      })
      setTimeout(this.getCost)
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

    this.getTotal()
  },
  getCost: function () {
    let {
      price = 0, bareCarPrice = 0, mode = 1, change_price = 0,
      purchase_tax = 0, insurance_price = 0, 
    } = this.data.formData

    if (insurance_price > 0) {
      wx.showToast({
        icon: 'none',
        title: '请重新计算商业保险'
      })
    }

    if (price > 0) {
      change_price = Math.max(0, change_price) // 大于0
      if (mode == 1) { // 优惠不能大于指导价
        change_price = Math.min(price, change_price)
      }

      // 裸车价
      bareCarPrice = price + (mode == 1 ? -change_price : change_price)
      // 购置税
      purchase_tax = bareCarPrice / (1 + 0.17) * 0.1
      // 商业保险
      insurance_price = 924 + 458.76 + price * 1.088 / 100
      insurance_price += 101.88 + price * 0.0045
      insurance_price += price * 0.25 / 100
      insurance_price += price * 0.15 / 100
      insurance_price += (924 + 458.76 + price * 1.088 / 100) * 20 / 100
      insurance_price += 6 * 50
      insurance_price += 400
    }
    
    this.setData({
      'formData.change_price': change_price,
      'formData.bareCarPrice': bareCarPrice,
      'formData.purchase_tax': Math.ceil(purchase_tax),
      'formData.insurance_price': 0
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

    total_fee += Number(bareCarPrice)
    total_fee += Number(purchase_tax)
    total_fee += Number(license_plate_priace)
    total_fee += Number(vehicle_vessel_tax)
    total_fee += Number(traffic_insurance_price)
    total_fee += Number(insurance_price)
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
        monthly_supply = (total_fee - down_payment_money) * (100 + annual_rate) / 100 / periods
      }

      total_fee = down_payment_money
    }
    this.setData({
      'formData.total_fee': Math.ceil(total_fee).toFixed(2),
      'formData.monthly_supply': Math.ceil(monthly_supply).toFixed(2)
    })
  },
  // 商业保险
  insuranceInfo: function () {
    if (this.data.formData.bareCarPrice) {
      app.navigateTo('insurance?price=' + this.data.formData.bareCarPrice)
    }else{
      wx.showToast({
        icon: 'none',
        title: '请先选择车型'
      })
    }
  },
  onInsuranceCb: function (price) {
    this.setData({ 
      'formData.insurance_price': price
    })

    setTimeout(this.getTotal, 50)
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