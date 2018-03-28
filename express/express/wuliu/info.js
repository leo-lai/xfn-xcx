// express/tuoyun/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consignmentType: ['','普通','专线'],
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 获取详情
  getInfo: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuInfo, { 
      distributionId: this.options.id
    }).then(({data}) => {
      let cars = []
      let tempObj = {}
      let tuoyunList = []
      data.goodsCars.forEach(carItem => {
        cars.push(carItem.goodsCarId)
        let {
          consignmentId,
          consignmentCode,
          startingPointAddress,
          startingPointLatitude,
          startingPointLongitude,
          destinationAddress,
          destinationLatitude,
          destinationLongitude,
          appointmentTimeDate
        } = carItem.consignmentVo
        let { costsAmount } = carItem.carCostsVo

        if (tempObj[consignmentCode] >= 0) {
          tuoyunList[tempObj[consignmentCode]].amount += costsAmount
          tuoyunList[tempObj[consignmentCode]].carList.push(carItem)
        } else {
          tuoyunList.push({
            consignmentId,
            consignmentCode,
            startingPointAddress,
            startingPointLatitude,
            startingPointLongitude,
            destinationAddress,
            destinationLatitude,
            destinationLongitude,
            appointmentTimeDate,
            goodsCarState: carItem.goodsCarState,
            amount: costsAmount,
            carList: [carItem]
          })
          tempObj[consignmentCode] = tuoyunList.length - 1
        }
      })
      data.cars = cars.join(',')
      data.tuoyunList = tuoyunList.map(tuoyunItem => {
        tuoyunItem.cars = tuoyunItem.carList.map(carItem => carItem.goodsCarId).join(',')
        return tuoyunItem
      })

      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 编辑
  eidtInfo: function () {
    let formData = app.utils.copyObj({
      distributionId: '',
      consignmentType: '',
      consignmentTypeLineId: '',
      consignmentTypeLineName: '',
      startingPointAddress: '',
      startingPointLatitude: '',
      startingPointLongitude: '',
      destinationAddress: '',
      destinationLatitude: '',
      destinationLongitude: '',
      remarks: ''
    }, this.data.info)

    formData.logisticsCarId = this.data.info.logisticsCar.logisticsCarId
    formData.licensePlateNumber = this.data.info.logisticsCar.licensePlateNumber
    formData.driverId = this.data.info.logisticsDriver.driverId
    formData.realName = this.data.info.logisticsDriver.realName
    formData.phoneNumber = this.data.info.logisticsDriver.phoneNumber
    formData.cardNo = this.data.info.logisticsDriver.cardNo
    formData.idcardPicOn = this.data.info.logisticsDriver.idcardPicOn
    formData.idcardPicOff = this.data.info.logisticsDriver.idcardPicOff

    app.storage.setItem('exp-wuliu-info', formData)
    app.navigateTo('add')
  },
  // 接单
  jiedan: function (event) {
    let distributionId = this.data.info.distributionId
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuJie, { distributionId }).then(_ => {
      app.storage.setItem('exp-wuliu-list-refresh', 1)
      app.toast('接单成功').then(_ => {
        this.getInfo()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  // 更改订单状态
  changeState: function (event) {
    let distributionId = event.currentTarget.id
    let state = event.target.dataset.state
    let msg = '操作成功'

    switch (state) {
      case '3':
        msg = '装车成功'
        break
    }
    wx.showLoading({ mask: true })
    app.post(app.config.wuliuState, {
      distributionId, state
    }).then(_ => {
      app.storage.setItem('exp-wuliu-list-refresh', 1)
      app.toast(msg).then(_ => {
        this.getInfo()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  // 到达目的地
  arrival: function (event) {
    let ids = event.currentTarget.dataset.ids
    ids = ids ? ids.split(',') : []
    let distributionId = ids[0] || ''
    let consignmentId = ids[1] || ''

    wx.showLoading({ mask: true })
    app.post(app.config.wuliuArrival, {
      distributionId, consignmentId
    }).then(_ => {
      app.storage.setItem('exp-wuliu-list-refresh', 1)
      app.toast('操作成功').then(_ => {
        this.getInfo()
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },

  // 导航
  openLocation: function (event) {
    let { name, lng, lat } = event.currentTarget.dataset
    wx.openLocation({
      latitude: lat * 1,
      longitude: lng * 1,
      name: '导航目的地',
      address: name
    })
  },

  // 预览图片
  previewImage: function (event) {
    let item = this.data.info.logisticsDriver
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [item.idcardPicOn, item.idcardPicOff]
    })
  }
})