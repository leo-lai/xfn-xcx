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
    buyTime: ['3天内', '7天内'],
    carsName: '',
    formData: {
      customerUsersName: '',
      phoneNumber: '',
      intentionCarId: '',
      expectWayId: '',
      buyTimeId: '',
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

    if (this.data.formData.buyTimeId === '') {
      this.showTopTips('请选择购车时间')
      return
    }
    this.data.formData.carPurchaseIntention = this.data.buyTime[this.data.formData.buyTimeId]

    wx.showLoading({ mask: true })
    app.post(app.config.login, this.data.formData).then(({ data }) => {
      // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处触发回调函数
      app.updateUserInfo(data)
      app.toast('登录成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})