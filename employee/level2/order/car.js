// level2/order/car.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    cheshen: { // 车身颜色
      index: -1,
      list: []
    },
    neishi: { // 内饰颜色
      index: -1,
      list: []
    },
    formData: {
      orderId: '',
      customerId: '',
      id: '',
      carsId: '',
      carsName: '',
      guidePrice: '',
      colorId: '',
      colorName: '',
      interiorId: '',
      interiorName: '',
      carNum: '',
      depositPrice: '',
      finalPrice: '',
      isDiscount: 1,
      changePrice: '',
      remark: '',
      nakedPrice: '', // 裸车价
      trafficCompulsoryInsurancePrice: '', //交强险
      commercialInsurancePrice: '' // 商业险
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-order-car').then(info => {
      if (info) {
        console.log(info)
        this.setData({
          'formData': Object.assign({}, this.data.formData, info)
        })
        this.getCheshen(info.familyId)
        this.getNeishi(info.familyId)
        
        setTimeout(_ => {
          this.finalPrice()
        }, 300)
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  onUnload: function () {
    app.storage.removeItem('lv2-order-car')
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
        case 'colorId':
          data['formData.colorName'] = this.data[picker].list[value].carColourName
          value = this.data[picker].list[value].carColourId
          
          break
        case 'interiorId':
          data['formData.interiorName'] = this.data[picker].list[value].interiorName
          value = this.data[picker].list[value].interiorId
          break
        case 'orgId':
          value = this.data[picker].list[value][id]
          break
        default:
          value = this.data[picker].list[value]
          break
      }
    }
    console.log(id, value)
    switch (id) {
      case 'userName':
      case 'userPhone':
        data['customerInfo.' + id] = value
        break
      case 'isDiscount':
      case 'changePrice':
      case 'nakedPrice':
      case 'trafficCompulsoryInsurancePrice':
      case 'commercialInsurancePrice':
        clearTimeout(this.priceId)
        this.priceId = setTimeout(_ => {
          this.finalPrice()
        }, 300)
      default:
        data['formData.' + id] = value
    }
    this.setData(data)
  },
  finalPrice: function () {
    let {
      isDiscount,
      changePrice,
      guidePrice,
      nakedPrice,
      trafficCompulsoryInsurancePrice,
      commercialInsurancePrice
    } = this.data.formData

    changePrice = isDiscount == 1 ? 0 - changePrice : Number(changePrice)

    guidePrice = Number(guidePrice) || 0
    trafficCompulsoryInsurancePrice = Number(trafficCompulsoryInsurancePrice) || 0
    commercialInsurancePrice = Number(commercialInsurancePrice) || 0

    nakedPrice = guidePrice + changePrice
    let finalPrice = nakedPrice + trafficCompulsoryInsurancePrice + commercialInsurancePrice
    
    this.setData({
      'formData.nakedPrice': nakedPrice,
      'formData.finalPrice': finalPrice
    })
  },
  // 选择车辆
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      let changePrice = this.data.formData.isDiscount == 1 ?
        (0 - this.data.formData.changePrice) : Number(this.data.formData.changePrice)
      this.setData({
        'formData.carsId': carType.id,
        'formData.carsName': carType.name,
        'formData.guidePrice': carType.price,
        'formData.nakedPrice': carType.price + changePrice,
        'formData.colorId': '',
        'formData.colorName': '',
        'formData.interiorId': '',
        'formData.interiorName': ''
      })
      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    if (!familyId) return
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.formData.colorId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    if (!familyId) return
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId === this.data.formData.interiorId),
        'neishi.list': data
      })
    })
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.carsId) {
      this.showTopTips('请选择车型')
      return
    }
    if (!this.data.formData.colorId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (!(this.data.formData.carNum > 0)) {
      this.showTopTips('请输入购买数量')
      return
    }
    // if (!(this.data.formData.depositPrice > 0)) {
    //   this.showTopTips('请输入定金金额')
    //   return
    // }
    if (!(this.data.formData.nakedPrice > 0)) {
      this.showTopTips('请输入裸车价')
      return
    }

    if (!this.data.formData.changePrice) {
      this.showTopTips('请输入' + (this.data.formData.isDiscount == 1 ? '优惠' : '加价') + '金额')
      return
    }
    let changePrice = this.data.formData.isDiscount == 1 ? 
      (0 - this.data.formData.changePrice) : this.data.formData.changePrice
    let formData = Object.assign({}, this.data.formData, { changePrice: changePrice })

    let ids = this.options.ids ? this.options.ids.split(',') : []
    if (!ids[0]) {
      this.showTopTips('资源订单ID为空')
      return
    }
    if (!ids[1]) {
      this.showTopTips('客户ID为空')
      return
    }
    formData.orderId = ids[0]
    formData.customerId = ids[1]
   
    wx.showLoading({ mask: true })
    app.post(formData.id ? app.config.lv2.orderEditCar : app.config.lv2.orderAddCar, formData)
    .then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getInfo()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})