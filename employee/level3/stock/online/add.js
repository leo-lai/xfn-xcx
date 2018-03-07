// level3/stock/online/add.js
const app = getApp()
let todayStr = new Date().format('yyyy-MM-dd')
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
    formData: {
      orgCarsConfigureId: '',
      carsId: '',
      carsName: '',
      colourId: '',
      guidingPrice: '',
      discountPrice: '',
      depositPrice: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
      switch (id) {
        case 'colourId':
          value = this.data[picker].list[value].carColourId
          break
        default:
          value = this.data[picker].list[value]
          if (app.utils.isObject(value)) {
            value = value.name
          }
          break
      }
    }

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      this.setData({
        'formData.carsId': carType.id,
        'formData.carsName': carType.name,
        'formData.guidingPrice': carType.price,
        'formData.colourId': ''
      })
      this.getCheshen(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.formData.colourId),
        'cheshen.list': data
      })
    })
  },
  submit: function () {
    if (!this.data.formData.carsId) {
      this.showTopTips('请选择车辆')
      return
    }
    if (!this.data.formData.colourId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (this.data.formData.discountPrice === '') {
      this.showTopTips('请填写优惠金额')
      return
    }
    // if (this.data.formData.depositPrice === '') {
    //   this.showTopTips('请填写默认收取定金')
    //   return
    // }

    wx.showLoading({ mask: true })
    app.post(app.config.carStockAdd, this.data.formData).then(({ data }) => {
      app.toast('新增成功', true).then(prevPage => {
        prevPage.getList && prevPage.getList()
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})