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
    // 阶梯费用
    gradePrice: [
      { minMileage: '', maxMileage: '', amount: ''}
    ],
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
      gradeFirst: '',
      gradeSecond: '',
      gradeThird: '',
      gradeFour: '',
      gradeFive: '',
      gradeSix: '',
      startPrice: '',
      startingMileage: '',
      lineInfoVoes: ''
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
      
    })
  },
  onShow: function () {
    app.checkLogin()
  },
  tabClick: function (e) {
    this.setData({
      'tabs.offset': e.currentTarget.offsetLeft,
      'tabs.index': e.currentTarget.id
    })
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
  gradePriceInput: function (event) {
    let { name, index } = event.currentTarget.dataset
    let value = event.detail.value
    console.log(name, index, value)

    let gradePrice = this.data.gradePrice
    gradePrice[index][name] = value
    this.setData({ gradePrice })
  },
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
  gradePriceAdd: function () {
    let gradePrice = this.data.gradePrice
    gradePrice.push({ minMileage: '', maxMileage: '', amount: '' })
    this.setData({ gradePrice })
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
    formData.lineInfoVoes = this.data.gradePrice.filter(item => {
      return item.minMileage !== '' && item.maxMileage !== '' && item.amount !== ''
    })
    console.log(formData)

    wx.showLoading({ mask: true })
    app.json(app.config.exp.freight1, formData).then(({data}) => {

    })
  }
})