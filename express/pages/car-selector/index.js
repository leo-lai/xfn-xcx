// pages/car-selector/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    brand: {
      visible: true,
      loading: false,
      slted: {},
      list: []
    },
    family: {
      visible: false,
      loading: false,
      slted: {},
      list: []
    },
    carType: {
      visible: false,
      loading: false,
      slted: {},
      list: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.ids = this.options.ids ? this.options.ids.split(',') : []
      this.getBrandList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 品牌列表
  getBrandList: function () {
    this.setData({ 'brand.loading': true })
    app.post(app.config.brandList).then(({ data }) => {
      this.setData({ 'brand.list': data })
      if (this.ids.length > 0) {
        let slted = data.filter(item => item.id == this.ids[0])[0]

        if (this.ids.length > 1) {
          this.sltBrand(slted)
        } else {
          this.setData({ 'brand.slted': slted })
        }
      }
    }).finally(_ => {
      this.setData({ 'brand.loading': false })
    })
  },
  sltBrand: function (event) {
    let item = event.currentTarget ? event.currentTarget.dataset.item : event
    this.setData({
      'brand.slted': item,
      'family.visible': true
    })
    app.storage.setItem('brand_slted', item)
    this.getFamilyList()
    // this.changeSlted()
  },
  // 车系列表
  getFamilyList: function () {
    this.setData({ 'family.loading': true })
    app.post(app.config.familyList, {
      brandId: this.data.brand.slted.id
    }).then(({ data }) => {
      this.setData({
        'family.list': data,
        'family.loading': false
      })

      if (this.ids.length > 1) {
        let slted = data.filter(item => item.id == this.ids[1])[0]

        if (this.ids.length > 2) {
          this.sltFamily(slted)
        } else {
          this.setData({ 'family.slted': slted })
        }
      }
    }).catch(_ => {
      this.setData({ 'family.loading': false })
    })
  },
  closeFamily: function() {
    this.setData({
      'family.visible': false
    })
  },
  sltFamily: function (event) {
    let item = event.currentTarget ? event.currentTarget.dataset.item : event
    this.setData({
      'family.slted': item,
      'carType.visible': true
    })
    app.storage.setItem('family_slted', item)
    this.getCarTypeList()
    // this.changeSlted()
  },
  // 车类列表
  getCarTypeList: function () {
    this.setData({ 'carType.loading': true })
    app.post(app.config.carTypeList, {
      brandId: this.data.brand.slted.id,
      familyId: this.data.family.slted.id
    }).then(({ data }) => {
      this.setData({ 'carType.list': data })
      if (this.ids.length > 2) {
        let slted = data.filter(item => item.id == this.ids[2])[0]
        this.setData({ 'carType.slted': slted })
      }
    }).finally(_ => {
      this.setData({ 'carType.loading': false })
    })
  },
  sltCarType: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      'carType.slted': item,
      'carType.visible': false
    })
    app.storage.setItem('carType_slted', item)
    this.changeSlted()
    app.back()
  },
  changeSlted: function () {
    app.getPrevPage().then(prevPage => {
      prevPage.changeCar && prevPage.changeCar(this.data.carType.slted, this.data.family.slted, this.data.brand.slted)
    })
  },
  closeCarType: function () {
    this.setData({
      'carType.visible': false
    })
  }
})