// level2/order/add-order.js
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
    isPayDeposit: false,
    customerInfo: {
      userName: '',
      userPhone: '',
      idCardPicOn: '',
      idCardPicOff: ''
    },
    carInfo: {
      carsId: '',
      carsName: '',
      guidePrice: '',
      familyId: '',
      colorId: '',
      colorName: '',
      interiorId: '',
      interiorName: '',
      carNum: 1,
      isDiscount: 1,
      changePrice: '',
      nakedPrice: '', // 裸车价
      trafficCompulsoryInsurancePrice: '', //交强险
      commercialInsurancePrice: '', // 商业险
      depositPrice: '',
      finalPrice: '',
      remark: '',
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    if (this.options.aid) {
      app.storage.getItem('shop-order-info').then(info => {
        console.log(info)
        if (info && info.orderInfoVos[0]) {
          this.setData({
            isPayDeposit: info.overPay
          })
          let orderCarInfo = info.orderInfoVos[0]
          let carInfo = app.utils.copyObj(this.data.carInfo, orderCarInfo) 
          carInfo.guidePrice = orderCarInfo.guidingPrice
          carInfo.nakedPrice = orderCarInfo.bareCarPriceOnLine
          carInfo.carNum = info.orderInfoVos.length
          carInfo.isDiscount = info.discountPriceOnLine > 0 ? 0 : 1
          carInfo.changePrice = Math.abs(info.discountPriceOnLine)

          this.setData({ carInfo })

          this.priceId = setTimeout(_ => {
            this.finalPrice()
            app.storage.setItem('shop-order-car-' + this.options.id, this.data.carInfo)
          }, 50)

          this.getCheshen(carInfo.familyId)
          this.getNeishi(carInfo.familyId)
        }
      })
    }else {
      app.storage.getItem('shop-order-car-' + this.options.id).then(info => {
        console.log(info)
        if (info) {
          this.setData({ 
            carInfo: app.utils.copyObj(this.data.carInfo, info)
          })
          this.priceId = setTimeout(_ => {
            this.finalPrice()
          }, 50)

          this.getCheshen(info.familyId)
          this.getNeishi(info.familyId)
        }
      })
    }
  },
  onUnload: function() {
    app.storage.removeItem('shop-order-info')
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
        case 'colorId':
          data['carInfo.colorName'] = this.data[picker].list[value].carColourName
          value = this.data[picker].list[value].carColourId
          
          break
        case 'interiorId':
          data['carInfo.interiorName'] = this.data[picker].list[value].interiorName
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
      case 'carNum':
      case 'isDiscount':
      case 'changePrice':
      case 'nakedPrice':
      case 'trafficCompulsoryInsurancePrice':
      case 'commercialInsurancePrice':
        clearTimeout(this.priceId)
        this.priceId = setTimeout(_ => {
          this.finalPrice()
        }, 50)
      default:
        data['carInfo.' + id] = value
    }
    this.setData(data)
  },
  finalPrice: function () {
    let {
      isDiscount,
      changePrice,
      guidePrice,
      nakedPrice,
      carNum,
      trafficCompulsoryInsurancePrice,
      commercialInsurancePrice
    } = this.data.carInfo

    changePrice = isDiscount == 1 ? 0 - changePrice : Number(changePrice)

    guidePrice = Number(guidePrice) || 0
    trafficCompulsoryInsurancePrice = Number(trafficCompulsoryInsurancePrice) || 0
    commercialInsurancePrice = Number(commercialInsurancePrice) || 0

    nakedPrice = guidePrice + changePrice
    let finalPrice = (nakedPrice + trafficCompulsoryInsurancePrice + commercialInsurancePrice) * carNum

    this.setData({
      'carInfo.nakedPrice': nakedPrice,
      'carInfo.finalPrice': finalPrice
    })
  },
  // 选择车辆
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.carInfo.carsId !== carType.id) {
      let changePrice = this.data.carInfo.isDiscount == 1 ?
        (0 - this.data.carInfo.changePrice) : Number(this.data.carInfo.changePrice)
      this.setData({
        'carInfo.carsId': carType.id,
        'carInfo.carsName': carType.name,
        'carInfo.guidePrice': carType.price,
        'carInfo.nakedPrice': carType.price + changePrice,
        'carInfo.colorId': '',
        'carInfo.colorName': '',
        'carInfo.interiorId': '',
        'carInfo.interiorName': ''
      })

      this.priceId = setTimeout(_ => {
        this.finalPrice()
      }, 50)

      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    if (!familyId) return
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.carInfo.colourId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    if (!familyId) return
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId === this.data.carInfo.interiorId),
        'neishi.list': data
      })
    })
  },
  // 选择图片
  chooseImage: function (event) {
    let id = event.currentTarget.id
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 上传图片到服务器
        wx.showLoading({
          title: '照片上传中'
        })
        console.log(res)
        wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFiles[0].path,
          name: 'img_file',
          success: res => {
            
            if (res.statusCode === 200) {
              if (typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }

              let tempData = {}
              tempData['customerInfo.' + id] = res.data.data
              this.setData(tempData)
              console.log(tempData)
              wx.hideLoading()
            } else {
              wx.showToast({
                image: '../../images/error.png',
                title: '上传失败(' + res.statusCode + ')'
              })
            }
          },
          fail: res => {
            wx.showToast({
              image: '../../images/error.png',
              title: '照片上传失败'
            })
          }
        })
      }
    })
  },
  // 保存信息
  submit: function () {
    if (!this.data.carInfo.carsId) {
      this.showTopTips('请选择车型')
      return
    }
    if (!this.data.carInfo.colorId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (!(this.data.carInfo.carNum > 0)) {
      this.showTopTips('请输入购买数量')
      return
    }
    // if (!(this.data.carInfo.depositPrice > 0)) {
    //   this.showTopTips('请输入定金金额')
    //   return
    // }
    if (!(this.data.carInfo.nakedPrice > 0)) {
      this.showTopTips('请输入裸车价')
      return
    }

    // if (!this.data.carInfo.changePrice) {
    //   this.showTopTips('请输入' + (this.data.carInfo.isDiscount == 1 ? '优惠' : '加价') + '金额')
    //   return
    // }

    let changePrice = this.data.carInfo.isDiscount == 1 ? 
      (0 - this.data.carInfo.changePrice) : this.data.carInfo.changePrice
    let carInfo = Object.assign({}, this.data.carInfo, { changePrice: changePrice })

    let formData = {
      orderId: this.options.id,
      customer: Object.assign({}, this.data.customerInfo),
      infos: [carInfo]
    }
    
    wx.showLoading({ mask: true })
    app.json(app.config.lv2.orderAddOrder, formData).then(({ data }) => {
      app.storage.removeItem('shop-order-car-' + this.options.id)
      app.storage.setItem('lv2-order-list-refresh', 1)

      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getInfo && prevPage.getInfo()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})