// pages/car-slt/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    years: [],
    sltedCar: {},
    sltedYear: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      app.storage.getItem('carInfo-tempCar').then(data => {
        this.setData({
          'sltedCar': data
        })
      })
      this.sourceList = []
      this.getList(options.id)
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 车系列表
  getList: function(familyId) {
    wx.showNavigationBarLoading()
    app.post(app.config.carListByFid, { familyId }).then(({ data }) => {
      let years = ['全部']
      data.forEach(item => {
        let year = item.yearPattern + '款'
        if (!years.includes(year)){
          years.push(year)
        }
        item.priceStr = (item.price / 10000).toFixed(2)
        this.sourceList.push(item)
      })
      this.setData({
        'years': years,
        'sltedYear': '全部'
      })
      this.filterList()
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  filterList: function() {
    if (this.data.sltedYear === '全部') {
      this.setData({
        'list': this.sourceList
      })
    }else{
      this.setData({
        'list': this.sourceList.filter(item => item.yearPattern + '款' === this.data.sltedYear)
      })  
    }
  },
  sltYear: function(event) { // 选择年份
    this.setData({
      'sltedYear': event.currentTarget.dataset.val
    })
    this.filterList()
  },
  sltCar: function(event) { // 选择车辆
    let item = event.currentTarget.dataset.item
    this.setData({ 'sltedCar': item })
    app.storage.setItem('carInfo-tempCar', item)
    app.back()
  }
})