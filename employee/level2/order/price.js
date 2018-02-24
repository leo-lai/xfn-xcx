// level2/order/price.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
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
    app.storage.getItem('lv2-order-car-price').then(info => {
      if (info) {
        this.setData({
          'formData': Object.assign({}, this.data.formData, info)
        })
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
    app.storage.removeItem('lv2-order-car-price')
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
  // 保存信息
  submit: function () {

    if (!this.data.formData.changePrice) {
      this.showTopTips('请输入' + (this.data.formData.isDiscount == 1 ? '优惠' : '加价') + '金额')
      return
    }
    
    let formData = app.utils.copyObj({
      infoId: this.options.id,
      changePrice: '',
      trafficCompulsoryInsurancePrice: '',
      commercialInsurancePrice: '',
      remark: ''
    }, this.data.formData)

    let changePrice = this.data.formData.isDiscount == 1 ?
      (0 - this.data.formData.changePrice) : this.data.formData.changePrice
    formData.changePrice = changePrice

    wx.showLoading({ mask: true })
    app.post(app.config.lv2.changeCarPrice, formData)
      .then(({ data }) => {
        app.toast('修改成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            prevPage.getCarFrame()
          })
        })
      }).catch(err => {
        wx.hideLoading()
      })
  }
})