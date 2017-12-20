// pages/cucstomer-add/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    userInfo: null,
    expectWay: ['全款', '分期'],
    buyTime: app.config.baseData.buyTime,
    carsName: '',
    formData: {
      customerUsersName: '',
      phoneNumber: '',
      intentionCarId: '',
      expectWayId: '',
      carPurchaseIntention: '',
      remarks: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('carType_slted').then(carTypeSlted => {
        this.setData({
          'carsName': carTypeSlted.name,
          'formData.intentionCarId': carTypeSlted.id
        })
      })
    }).finally(_ => {
      app.storage.setItem('current_page', this.route)
    })
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
    data['formData.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  submit: function() {
    if (!this.data.formData.customerUsersName) {
      this.showTopTips('请输入客户真实名称')
      return
    }
    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入客户手机号码')
      return
    }
    if (!this.data.formData.intentionCarId) {
      this.showTopTips('请选择意向车辆')
      return
    }
    if (this.data.formData.expectWayId === '') {
      this.showTopTips('请选择购车方案')
      return
    }
    this.data.formData.expectWayId++

    if (this.data.formData.carPurchaseIntention === '') {
      this.showTopTips('请选择购车时间')
      return
    }
    this.data.formData.carPurchaseIntention++

    wx.showLoading({ mask: true })
    app.post(app.config.customerAdd, this.data.formData).then(({ data }) => {
      app.toast('新增成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})