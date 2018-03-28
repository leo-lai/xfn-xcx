// express/tuoyun/add-car.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cheshen: { // 车身颜色
      index: -1,
      list: []
    },
    neishi: { // 内饰颜色
      index: -1,
      list: []
    },
    formData: {
      carsId: '',
      carsName: '',
      guidePrice: '',
      carNum: 1,
      colourId: '',
      colourName: '',
      interiorId: '',
      interiorName: '',
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // setTimeout(_ => {
    //   app.navigateTo('/pages/car-selector/index')
    // }, 300)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
          data['formData.colourName'] = this.data[picker].list[value].carColourName
          value = this.data[picker].list[value].carColourId
          break
        case 'interiorId':
          data['formData.interiorName'] = this.data[picker].list[value].interiorName
          value = this.data[picker].list[value].interiorId
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
        'formData.guidePrice': (carType.price / 10000).toFixed(2),
        'formData.colourId': '',
        'formData.colourName': '',
        'carInfo.interiorId': '',
        'carInfo.interiorName': ''
      })
      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    if (!familyId) return
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.formData.colourId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    if (!familyId) return
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId === this.data.carInfo.interiorId),
        'neishi.list': data
      })
    })
  },
  submit: function () {
    if(!this.data.formData.carsId){
      wx.showModal({
        content: '请选择车型',
        showCancel: false
      })
      return
    }

    if (!(this.data.formData.carNum > 0)) {
      wx.showModal({
        content: '请输入托运车辆数量',
        showCancel: false
      })
      return
    }

    this.data.formData.guid = app.utils.guid()
    app.getPrevPage().then(prevPage => {
      prevPage.addCarCb && prevPage.addCarCb(this.data.formData)
      app.back()
    })
  }
})