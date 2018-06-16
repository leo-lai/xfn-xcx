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
      this.setData({
        userInfo,
        'auditor': userInfo.roleName.indexOf('资源主管') !== -1,
      })
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
    app.post(app.config.exp.wuliuInfo, { 
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
          destinationAddress,
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
            destinationAddress,
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
      
      this.setData({
        info: data
      })
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
    formData.logisticsCarVacancy = this.data.info.logisticsCar.logisticsCarVacancy
    formData.driverId = this.data.info.logisticsDriver.driverId
    formData.realName = this.data.info.logisticsDriver.realName
    formData.phoneNumber = this.data.info.logisticsDriver.phoneNumber
    formData.cardNo = this.data.info.logisticsDriver.cardNo
    formData.idcardPicOn = this.data.info.logisticsDriver.idcardPicOn
    formData.idcardPicOff = this.data.info.logisticsDriver.idcardPicOff

    app.storage.setItem('exp-wuliu-info', formData)
    app.navigateTo('add')
  },
  // 派单
  paidan: function (event) {
    let distributionId = this.data.info.distributionId
    wx.showModal({
      content: '派单后物流单信息不可再更改，请确定物流单信息是否正确？',
      confirmText: '确定派单',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.exp.wuliuPai, { distributionId }).then(_ => {
            wx.hideLoading()
            app.toast('派单成功').then(_ => {
              this.getInfo()
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
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
    app.post(app.config.exp.wuliuState, {
      distributionId, state
    }).then(_ => {
      app.storage.setItem('exp-wuliu-list-refresh', 1)
      wx.hideLoading()
      app.toast(msg).then(_ => {
        this.getInfo()
      })
    }).catch(_ => {
      wx.hideLoading()
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