// level3/customer/order.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    diya: ['不抵押', '抵押'],
    bank: { // 贷款银行
      index: -1,
      list: [
        { id: 1, name: '奇瑞金融' },
        { id: 2, name: '瑞福德金融' },
        { id: 3, name: '建设银行' },
        { id: 4, name: '农业银行' },
        { id: 5, name: '工商银行' },
        { id: 6, name: '广州银行' },
        { id: 7, name: '鹤山珠江村镇银行' },
        { id: 8, name: '鹤山农村信用合作社' },
        //{ id: 9, name: '锐诚金融' },
      ]
    },
    sales: { // 销售人员
      index: -1,
      list: []
    },
    cheshen: { // 车身颜色
      index: -1,
      list: []
    },
    neishi: { // 内饰颜色
      index: -1,
      list: []
    },
    carParts: { 
      list1: [],   // 赠送精品
      list2: [],  // 加装精品
    },
    isPayDeposit: false,
    orderPay: '0.00',
    orderInfo: {
      customerOrderId: '',
      customerOrderState: '',
      isMortgage: 1
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.$params = {
        ids: this.options.ids ? this.options.ids.split(',') : ['', '']
      }
      this.getInfo().then(_ => {
        console.log(this.data.orderInfo)
        // this.getSales()
        this.getOrderPay()
        let followInformation = this.data.orderInfo.followInformation ? this.data.orderInfo.followInformation.split(',') : []
        let boutiqueInformation = this.data.orderInfo.boutiqueInformation ? this.data.orderInfo.boutiqueInformation.split(',') : []
        this.setData({
          'carParts.list1': app.config.baseData.carParts.map((item, index) => {
            return {
              id: index + 1,
              checked: followInformation.includes(item),
              name: item
            }
          }),
          'carParts.list2': app.config.baseData.carParts.map((item, index) => {
            return {
              id: index + 1,
              checked: boutiqueInformation.includes(item),
              name: item
            }
          })
        })
      })
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
  getBeforeInfo: function() {
    if(this.options.aid) {
      return app.storage.getItem('shop-order-info').then(info => {
        let orderInfo = info
        if (info) {
          // 是否已交定金
          this.setData({
            isPayDeposit: info.overPay
          })
          let carInfo = info.orderInfoVos[0]
          orderInfo = {
            advanceOrderId: this.options.aid,
            brandId: carInfo.brandId,
            familyId: carInfo.familyId,
            carsId: carInfo.carsId,
            carsName: carInfo.carsName,
            colourId: carInfo.colourId,
            interiorId: carInfo.interiorId,
            guidingPrice: carInfo.guidingPrice,
            depositPrice: info.depositPrice,
            systemUserId: info.systemUserId,
            systemUserName: info.systemUserName,
            paymentWay: info.expectBuyWay
          }
        }
        return { data: orderInfo }
      })
    }else{
      if (this.$params.ids[0]) {
        return app.post(app.config.customerOrderBefore, {
          customerUsersId: this.$params.ids[0]
        })
      }else{
        return Promise.resolve({data: null})
      }
    }
  },
  getInfo: function () {
    return new Promise((resolve, reject) => {
      wx.showNavigationBarLoading()
      this.getBeforeInfo().then(({data}) => {
        let orderInfo = Object.assign({}, this.data.orderInfo, data)

        if (this.$params.ids[1]) {
          app.post(app.config.customerOrderInfo, {
            customerOrderId: this.$params.ids[1]
          }).then(({ data }) => {
            orderInfo = Object.assign(orderInfo, data)
            resolve(orderInfo)
          }).catch(reject)
        } else {
          resolve(orderInfo)
        }
      }).catch(reject)
    }).then(orderInfo => {
      this.setData({
        orderInfo,
        'bank.index': this.data.bank.list.findIndex(item => item.id === orderInfo.loanBank)
      })
      if (orderInfo.familyId) {
        this.getCheshen(orderInfo.familyId)
        this.getNeishi(orderInfo.familyId)
      }
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.orderInfo.carsId !== carType.id) {
      this.setData({
        'orderInfo.carsId': carType.id,
        'orderInfo.carsName': carType.name,
        'orderInfo.guidingPrice': carType.price,
        'orderInfo.familyId': family.id,
        'orderInfo.brandId': brand.id,
        'orderInfo.colourId': '',
        'orderInfo.interiorId': ''
      })
      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getOrderPay: function () { // 合计费用
    let orderPay = (Number(this.data.orderInfo.carUnitPrice) || 0)
      + (Number(this.data.orderInfo.purchaseTaxPriace) || 0)
      + (Number(this.data.orderInfo.licensePlatePriace) || 0)
      + (Number(this.data.orderInfo.insurancePriace) || 0)
      + (Number(this.data.orderInfo.mortgagePriace) || 0)
      + (Number(this.data.orderInfo.boutiquePriace) || 0)
      + (Number(this.data.orderInfo.vehicleAndVesselTax) || 0)
    let data = {
      'orderPay': orderPay.toFixed(2)
    }

    if (this.data.orderInfo.loan !== '') {
      data['orderInfo.downPayments'] = orderPay - Number(this.data.orderInfo.loan)
    }
    this.setData(data)
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.orderInfo.colourId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId === this.data.orderInfo.interiorId),
        'neishi.list': data
      })
    })
  },
  getSales: function () { // 获取销售顾问列表
    app.post(app.config.salesList).then(({ data }) => {
      this.setData({
        'sales.index': data.findIndex(item => item.systemUserId === this.data.orderInfo.systemUserId),
        'sales.list': data
      })
    })
  },
  showCarParts: function (event) {
    let _type = event.currentTarget.dataset.type
    app.storage.setItem('customer_order_jing', this.data.carParts['list' + _type])
    app.navigateTo('jing?type=' + _type)
  },
  submit: function () {
    if (!this.data.orderInfo.customerUserCard) {
      this.showTopTips('请填写客户身份证号')
      return
    }
    if (!this.data.orderInfo.carsId) {
      this.showTopTips('请选择订购车辆')
      return
    }
    if (!this.data.orderInfo.colourId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (!this.data.orderInfo.interiorId) {
      this.showTopTips('请选择内饰颜色')
      return
    }
    // if (!(this.data.orderInfo.depositPrice > 0)) {
    //   this.showTopTips('请填写收取定金')
    //   return
    // }
    if (!(this.data.orderInfo.carUnitPrice > 0)) {
      this.showTopTips('请填写实际成交裸车价')
      return
    }

    let formData = app.utils.copyObj({
      advanceOrderId: '',
      customerUsersId: '',
      customerOrderId: '',
      customerUserCard: '',
      brandId: '',
      familyId: '',
      carsId: '',
      colourId: '',
      interiorId: '',
      isMortgage: '',
      carUnitPrice: '',
      paymentWay: '',
      downPayments: '',
      loan: '',
      loanPayBackStages: '',
      licensePlatePriace: '',
      insurancePriace: '',
      followInformation: '',
      boutiqueInformation: '',
      remark: '',
      purchaseTaxPriace: '',
      boutiquePriace: '',
      mortgagePriace: '',
      loanBank: '',
      systemUserId: '',
      depositPrice: '',
      vehicleAndVesselTax: ''
    }, this.data.orderInfo)

    if (Number.isNaN(formData.downPayments)) {
      formData.downPayments = ''
    }
    wx.showLoading({ mask: true })
    app.post(app.config.customerOrderAdd, formData).then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getList && prevPage.getList()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})