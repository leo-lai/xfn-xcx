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
    intensity: {
      index: -1,
      list: ['高', '中', '低']
    },
    makeSource: {
      index: -1,
      list: ['4S店', '微信', '朋友介绍', '公众号', '直接到店', '其他']
    },
    buyWay: app.config.baseData.buyWay,
    buyTime: app.config.baseData.buyTime,
    formData: {
      advanceOrderId: '',
      customerUsersName: '',
      phoneNumber: '',
      appointmentDate: '',
      timeOfAppointment: '',
      carsName: '',
      intentionCarId: '',
      expectWayId: '',
      carPurchaseIntention: '',
      intensity: '',    // 客户强度
      makeSource: '',   // 客户来源
      remarks: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    if (this.options.aid) {
      this.setData({
        'formData.advanceOrderId': this.options.aid
      })
      app.storage.getItem('shop-order-info').then(info => {
        if (info) {
          let formData = {
            customerUsersName: info.realName,
            phoneNumber: info.phoneNumber,
            appointmentDate: info.timeOfAppointmentDate ? info.timeOfAppointmentDate.split(' ')[0] : '',
            carsName: info.orderInfoVos[0].carsName,
            intentionCarId: info.orderInfoVos[0].carsId,
            expectWayId: info.expectBuyWay - 1,
            remarks: info.remarks
          }
          this.setData({
            formData: app.utils.copyObj(this.data.formData, formData),
          })
        }
      })
    }
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
      app.storage.setItem('lv3-customer-list-refresh', 1)
      app.toast('保存成功', true).then(_ => {
        // if(data) {
        //   if (this.data.formData.advanceOrderId) {
        //     app.navigateTo(`order?ids=${data.customerUsersId}&aid=${this.data.formData.advanceOrderId}`)
        //   } else {
        //     app.navigateTo(`info?ids=${data.customerUsersId},${data.customerUsersOrgId}`)
        //   }
        // }else{
        //   app.back()
        // }
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})