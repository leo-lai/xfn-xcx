// express/freight/selector.js
const app = getApp()
Page({
  data: {
    topTips: '',
    tabs: {
      tit: ['普通运输', '专线运输'],
      index: 0,
      offset: 0,
      left: 0
    },
    consignmentType: '',
    consignmentTypeLineId: '',

    // 附加费用
    gradeCar: [
      { min: 0, max: 10, price: '', name: 'gradeFirst' },
      { min: 10, max: 20, price: '', name: 'gradeSecond' },
      { min: 20, max: 30, price: '', name: 'gradeThird' },
      { min: 30, max: 40, price: '', name: 'gradeFour' },
      { min: 50, max: 60, price: '', name: 'gradeFive' },
      { min: 60, max: '', price: '', name: 'gradeSix' }
    ],
    formData: {
      consignmentType: 1,
      dynamicLineId: '',
      gradeFirst: '',
      gradeSecond: '',
      gradeThird: '',
      gradeFour: '',
      gradeFive: '',
      gradeSix: '',
      startPrice: '',
      startingMileage: '',
      // 阶梯费用
      list: [
        { minMileage: '', maxMileage: '', amount: '' }
      ]
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      rows: 100,
      data: []
    }
  },
  onReady: function () {
    app.onLogin(userInfo => {
      wx.showLoading()
      this.getList().then(_ => {
        this.getInfo()
      })
    }, this.route)
  },
  onShow: function () {
    app.checkLogin()
  },
  // 非专线详情
  getInfo: function () {
    app.post(app.config.exp.freight1Info).then(({ data }) => {
      this.setData({
        'formData': data,
        'gradeCar': this.data.gradeCar.map(item => {
          item.price = data[item.name]
          return item
        })
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  submit: function () {
    if (!this.data.formData.startingMileage) {
      this.showTopTips('请填写起步里程')
      return
    }
    if (!this.data.formData.startPrice) {
      this.showTopTips('请填写起步价格')
      return
    }
    let formData = this.data.formData
    formData.list = formData.list.filter(item => {
      return item.minMileage !== '' && item.amount !== ''
    })

    wx.showLoading({ mask: true })
    app.json(app.config.exp.freight1, formData).then(({ data }) => {
      this.getInfo()
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  // 专线列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.exp.freight2List, {
      page,
      rows: this.data.list.rows
    }).then(({ data }) => {
      data.list.map(item => {
        item.consignmentType = 2
        return item
      })
      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).catch(_ => {
      wx.hideLoading()
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  },
  // 选择普通运输
  sltFreight1: function () {
    this.setData({
      consignmentType: 1,
      consignmentTypeLineId: this.data.formData.dynamicLineId
    })
    this.freightCb({
      consignmentType: 1,
      consignmentTypeLineId: this.data.formData.dynamicLineId,
      consignmentTypeLineName: '',
      startingPointAddress: '',
      startingPointLatitude: '',
      startingPointLongitude: '',
      destinationAddress: '',
      destinationLatitude: '',
      destinationLongitude: '',
    })
  },
  // 选择专线运输
  sltFreight2: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      consignmentType: 2,
      consignmentTypeLineId: item.dedicatedLineId
    })
    this.freightCb({
      consignmentType: 2,
      consignmentTypeLineId: item.dedicatedLineId,
      consignmentTypeLineName: item.dedicatedLineName,
      startingPointAddress: item.startingPointAddress,
      startingPointLatitude: item.startingPointLatitude,
      startingPointLongitude: item.startingPointLongitude,
      destinationAddress: item.destinationAddress,
      destinationLatitude: item.destinationLatitude,
      destinationLongitude: item.destinationLongitude,
    })
  },
  freightCb: function (info) {
    app.getPrevPage().then(prevPage => {
      prevPage.freightCb && prevPage.freightCb(info)
      app.back()
    })
  }
})