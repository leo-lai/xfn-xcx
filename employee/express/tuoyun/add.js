// express/tuoyun/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    formData: {
      orgId: '',
      purchasersName: '',
      purchasersPhone: '',
      consignmentType: '',
      consignmentTypeLineId: '',
      consignmentTypeLineName: '',
      startingPointAddress: '',
      startingPointLatitude: '',
      startingPointLongitude: '',
      destinationAddress: '',
      destinationLatitude: '',
      destinationLongitude: '',
      amount: 0,         // 总费用
      grade: 0,          // 附加费用
      mileage: 0,        // 公里数
      estimateAmount: 0, // 预测费用
      initiateRate: 0,   // 起步价
      overflow: 0,       // 溢出价格
      appointmentTime: '',
      leaveTheCarPerson: [],
      extractTheCarPerson: [],
      goodsCarVos: []
    },
    carList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
  // 选择门店
  changeStore: function (storeInfo) {
    console.log(storeInfo)
    if (storeInfo) {
      this.setData({
        'formData.orgId': storeInfo.orgId,
        'formData.orgName': storeInfo.shortName,
        'formData.purchasersName': storeInfo.linkMan,
        'formData.purchasersPhone': storeInfo.telePhone
      })
    }
  },
  // 选择运输方式
  freightCb: function (info) {
    if(info) {
      this.setData({
        'formData.consignmentType': info.consignmentType,
        'formData.consignmentTypeLineId': info.consignmentTypeLineId,
        'formData.consignmentTypeLineName': info.consignmentTypeLineName,
        'formData.startingPointAddress': info.startingPointAddress,
        'formData.startingPointLatitude': info.startingPointLatitude,
        'formData.startingPointLongitude': info.startingPointLongitude,
        'formData.destinationAddress': info.destinationAddress,
        'formData.destinationLatitude': info.destinationLatitude,
        'formData.destinationLongitude': info.destinationLongitude,
      })
    }
  },
  // 选择地点
  chooseLoc: function (event) {
    if (this.data.formData.consignmentType == 2) return

    let id = event.currentTarget.id
    wx.chooseLocation({
      success: res => {
        console.log(res)
        switch (id) {
          case 'startingPointAddress':
            this.setData({
              'formData.startingPointAddress': res.address + res.name,
              'formData.startingPointLatitude': res.latitude,
              'formData.startingPointLongitude': res.longitude,
            })
            break
          case 'destinationAddress':
            this.setData({
              'formData.destinationAddress': res.address + res.name,
              'formData.destinationLatitude': res.latitude,
              'formData.destinationLongitude': res.longitude,
            })
            break
        }
      }
    })
  },
  // 选择时间
  onDatetime: function (datetime) {
    if (datetime) {
      this.setData({
        'formData.appointmentTime': `${datetime[0]}-${datetime[1]}-${datetime[2]} ${datetime[3]}:${datetime[4]}`
      })
    }
  },
  // 添加托运车辆
  addCarCb: function (info) {
    if(info) {
      this.setData({
        carList: [...this.data.carList, info]
      })
    }
  },
  // 删除车辆
  delCar: function (event) {
    let guid = event.currentTarget.id
    this.setData({
      carList: this.data.carList.filter(item => item.guid !== guid)
    })
  },

  // 查询信息
  submit: function () {
    // if (!this.data.formData.orgId) {
    //   this.showTopTips('请选择门店名称')
    //   return
    // }
    if (!this.data.formData.purchasersName) {
      this.showTopTips('请输入联系人姓名')
      return
    }
    if (!this.data.formData.purchasersPhone) {
      this.showTopTips('请输入联系电话')
      return
    }
    if (!this.data.formData.startingPointAddress) {
      this.showTopTips('请选择装车地点')
      return
    }
    if (!this.data.formData.destinationAddress) {
      this.showTopTips('请选择卸车地点')
      return
    }

    if (this.data.carList.length <= 0) {
      this.showTopTips('请添加托运车辆')
      return
    }

    let carList = []
    this.data.carList.forEach(item => {
      let carItem = app.utils.copyObj({
        carsId: '',
        carsName: '',
        colourId: '',
        colourName: '',
        interiorId: '',
        interiorName: '',
      }, item)
      for (let i = 0; i < item.carNum; i++) {
        carList.push(carItem)
      }
    })

    this.setData({
      'formData.goodsCarVos': carList
    })

    console.log(carList)

    let formData = app.utils.copyObj({
      consignmentType: '',
      consignmentTypeLineId: '',
      appointmentTime: '',
      startingPointAddress: '',
      startingPointLongitude: '',
      startingPointLatitude: '',
      destinationAddress: '',
      destinationLongitude: '',
      destinationLatitude: '',
      carsIds: carList.map(item => item.carsId).join(','),
      number: carList.length
    }, this.data.formData)


    wx.showLoading({ mask: true })
    app.post(app.config.exp.tuoyunCount, formData).then(({ data }) => {
      app.storage.setItem('exp-tuoyun-freight', Object.assign({}, formData, data))
      app.navigateTo('freight')
    }).finally(err => {
      wx.hideLoading()
    })
  }
})