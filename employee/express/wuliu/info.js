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

  getInfo: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.exp.wuliuInfo, { 
      distributionId: this.options.id
    }).then(({data}) => {
      let ids = []
      let tuoyunList = {}
      data.goodsCars.forEach(carItem => {
        ids.push(carItem.goodsCarId)
        let {
          consignmentId,
          consignmentCode,
          startingPointAddress,
          destinationAddress
          } = carItem.consignmentVo
        let { costsAmount } = carItem.carCostsVo
        if (tuoyunList[consignmentCode]) {
          tuoyunList[consignmentCode].amount += costsAmount
          tuoyunList[consignmentCode].carList.push(carItem)
        } else {
          tuoyunList[consignmentCode] = {
            consignmentId: consignmentId,
            consignmentCode: consignmentCode,
            startingPointAddress: startingPointAddress,
            destinationAddress: destinationAddress,
            amount: costsAmount,
            carList: [carItem]
          }
        }
      })
      data.ids = ids.join(',')
      data.tuoyunList = tuoyunList
      console.log(data)
      this.setData({
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },

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

  paidan: function (event) {
    let distributionId = this.data.info.distributionId
    wx.showModal({
      content: '派单后物流单信息不可再更改，请确定物流单信息是否正确？',
      confirmText: '确定派单',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.exp.wuliuPai, { distributionId }).then(_ => {
            app.toast('派单成功').then(_ => {
              this.getInfo()
            })
          }).finally(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  previewImage: function (event) {
    let item = this.data.info.logisticsDriver
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [item.idcardPicOn, item.idcardPicOff]
    })
  }
})