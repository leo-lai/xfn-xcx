// express/freight/index.js
const app = getApp()
const sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    topTips: '',
    tabs: {
      tit: ['普通运输', '专线运输'],
      index: 0,
      offset: 0,
      left: 0
    },
    // 附加费用
    gradeCar: [
      { min: 0 , max: 10, price: '', name: 'gradeFirst'},
      { min: 10, max: 20, price: '', name: 'gradeSecond'},
      { min: 20, max: 30, price: '', name: 'gradeThird'},
      { min: 30, max: 40, price: '', name: 'gradeFour'},
      { min: 50, max: 60, price: '', name: 'gradeFive'},
      { min: 60, max: '', price: '', name: 'gradeSix'}
    ],
    formData: {
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
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          'tabs.left': (res.windowWidth / that.data.tabs.tit.length - sliderWidth) / 2,
          'tabs.offset': res.windowWidth / that.data.tabs.tit.length * that.data.tabs.index
        })
      }
    })
  },
  onReady: function () {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
  },
  onShow: function () {
    app.checkLogin()
  },
  tabClick: function (event) {
    this.setData({
      'tabs.offset': event.currentTarget.offsetLeft,
      'tabs.index': event.currentTarget.id
    })

    if (event.currentTarget.id == 1) {
      this.getList()
    }
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
    let value = event.detail.value

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 阶梯费用
  gradePriceInput: function (event) {
    let { name, index } = event.currentTarget.dataset
    let value = event.detail.value
    console.log(name, index, value)

    let gradePrice = this.data.formData.list
    gradePrice[index][name] = value
    this.setData({ 'formData.list': gradePrice })
  },
  gradePriceAdd: function () {
    let gradePrice = this.data.formData.list
    gradePrice.push({ minMileage: '', maxMileage: '', amount: '' })
    this.setData({ 'formData.list': gradePrice })
  },
  // 附加费用
  gradeCarInput: function (event) {
    let { name, index } = event.currentTarget.dataset
    let value = event.detail.value
    console.log(name, index, value)

    let gradeCar = this.data.gradeCar
    gradeCar[index][name] = value

    let data = {}
    data['formData.' + gradeCar[index].name] = value
    data['gradeCar'] = gradeCar
    this.setData(data)
  },
  // 非专线详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.exp.freight1Info).then(({data}) => {
      console.log(data)
      this.setData({ 
        'formData': app.utils.copyObj(this.data.formData, data),
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
    app.json(app.config.exp.freight1, formData).then(({data}) => {
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
      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  },
  // 专线详情
  showFreight2Info: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('l-freight2-info', item)
    app.navigateTo('add')
  }
})