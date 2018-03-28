// express/tuoyun/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    consignmentType: ['普通', '专线'],
    formData: {
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
      logisticsCarId: '',
      licensePlateNumber: '',
      logisticsCarVacancy: '',
      driverId: '',
      realName: '',
      phoneNumber: '',
      cardNo: '',
      idcardPicOn: '',
      idcardPicOff: '',
      remarks: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      app.storage.getItem('exp-wuliu-info').then(info => {
        if (info) {
          this.setData({
            'formData': app.utils.copyObj(this.data.formData, info)
          })
        }
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  onUnload: function () {
    app.storage.removeItem('exp-wuliu-info')
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
  // 选择板车
  drayCb: function (info) {
    if (info) {
      this.setData({
        'formData.logisticsCarId': info.logisticsCarId,
        'formData.licensePlateNumber': info.licensePlateNumber,
        'formData.consignmentType': info.consignmentType,
        'formData.logisticsCarVacancy': info.logisticsCarVacancy
      })
    }
  },
  // 选择司机
  driverCb: function (info) {
    if (info) {
      this.setData({
        'formData.driverId': info.driverId,
        'formData.realName': info.realName,
        'formData.phoneNumber': info.phoneNumber,
        'formData.cardNo': info.cardNo,
        'formData.idcardPicOn': info.idcardPicOn,
        'formData.idcardPicOff': info.idcardPicOff
      })
    }
  },

  // 保存信息
  submit: function () {
    // if (!this.data.formData.consignmentType) {
    //   this.showTopTips('请选择运输方式')
    //   return
    // }
    // if (!this.data.formData.startingPointAddress) {
    //   this.showTopTips('请选择装车地点')
    //   return
    // }
    // if (!this.data.formData.destinationAddress) {
    //   this.showTopTips('请选择卸车地点')
    //   return
    // }
    if (!this.data.formData.logisticsCarId) {
      this.showTopTips('请选择板车')
      return
    }
    if (!this.data.formData.driverId) {
      this.showTopTips('请选择司机')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.exp.wuliuAdd, this.data.formData).then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          if (this.data.formData.distributionId) {
            prevPage.getInfo && prevPage.getInfo()
          }else{
            wx.hideLoading()
            prevPage.getList && prevPage.getList()
          }
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})