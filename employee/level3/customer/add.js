// level3/customer/add.js
const app = getApp()
let todayStr = new Date().format('yyyy-MM-dd')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    todayStr,
    times: {
      index: -1,
      list: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00']
    },
    buyWay: app.config.baseData.buyWay,
    buyTime: app.config.baseData.buyTime,
    formData: {
      customerUsersName: '',
      phoneNumber: '',
      appointmentDate: todayStr,
      timeOfAppointment: '',
      carsName: '',
      intentionCarId: '',
      expectWayId: '',
      carPurchaseIntention: '',
      remarks: ''
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
        default:
          value = this.data[picker].list[value]
          break
      }
    }
    data['formData.' + id] = value
    this.setData(data)
  },
  changeCar: function (carInfo = {}) {
    this.setData({
      'formData.carsName': carInfo.name,
      'formData.intentionCarId': carInfo.id
    })
  },
  submit: function () {
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
    if (this.data.formData.carPurchaseIntention === '') {
      this.showTopTips('请选择购车时间')
      return
    }

    let formData = Object.assign({}, this.data.formData)
    formData.expectWayId = Number(this.data.formData.expectWayId) + 1
    formData.carPurchaseIntention = Number(this.data.formData.carPurchaseIntention) + 1

    wx.showLoading({ mask: true })
    app.post(app.config.customerAdd, formData).then(({ data }) => {
      app.toast('新增成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getList && prevPage.getList()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})