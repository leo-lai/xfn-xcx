// level2/order/car-match.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    carFrame: [],
    frameList: {
      visible: false,
      height: 602 - 200,
      loading: false,
      slted: [],
      list: [],
      data: {
        customerOrderId: '',
        stockCarId: ''
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          'frameList.height': res.windowHeight - 200
        })
      }
    })

    app.onLogin(userInfo => {
      this.setData({
        userInfo,
        'auditor': userInfo.roleName.indexOf('资源主管') !== -1,
        'showEdit': this.options.edit !== '0'
      })

      let title = '配车'
      app.storage.getItem('lv2-order-car-info').then(info => {
        if (info) {
          if(info.orderState == '15') title = '验车'
          this.setData({ info })
          this.getCarFrame()
        }

        wx.setNavigationBarTitle({ title })
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('lv2-order-car-info')
  },
  // 获取已配的车架号
  getCarFrame: function () {
    wx.showLoading()
    app.post(app.config.lv2.carFrame, {
      infoId: this.data.info.id
    }).then(({data}) => {
      this.setData({ 
        'carFrame': data.map(item => {
          item.checkImages = item.checkCarPic ? item.checkCarPic.split(',') : []
          item.isTicket = !!(item.ticketPic || item.certificationPic || item.tciPic || item.ciPic || item.expressPic || item.otherPic)
          return item
        }) 
      })
    }).finally(_ => {
      this.data.carFrame.length === 0 ? this.getFrameList() : wx.hideLoading()
    })
  },
  // 获取车架号列表
  getFrameList: function () {
    wx.showLoading()
    app.post(app.config.lv2.frameList, {
      infoId: this.data.info.id
    }).then(({ data }) => {
      this.setData({
        'frameList.slted': [],
        'frameList.list': data ? data.map(item => {
          item.checked = false
          return item
        }) : []
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  sltFrameList: function (event) {
    this.setData({
      'frameList.slted': event.detail.value
    })
  },
  showFrameList: function () {
    this.setData({
      'frameList.visible': true
    })
  },
  closeFrameList: function () {
    this.setData({
      'frameList.visible': false
    })
  },
  sltFrameOk: function () {
    if (this.data.frameList.slted.length === 0) {
      wx.showModal({
        content: '请选择车架号',
        showCancel: false
      })
      return
    }

    if (this.data.frameList.slted.length != this.data.info.carNum) {
      wx.showModal({
        content: '分配车辆数量与订单车辆数量不一致',
        showCancel: false
      })
      return
    }

    this.setData({ 'frameList.loading': true })
    app.post(app.config.lv2.carMatch, {
      infoId: this.data.info.id,
      stockCarIds: this.data.frameList.slted.join(',')
    }).then(_ => {
      app.toast('保存成功', true).then(_ => {
        this.closeFrameList()
        this.getCarFrame()
        app.storage.setItem('lv2-order-list-refresh', 1)
        app.getPrevPage().then(prevPage => prevPage.getInfo && prevPage.getInfo())
      })
    }).finally(_ => {
      this.setData({ 'frameList.loading': false })
    })
  },
  // 验车
  carCheck: function (event) {
    let item = event.currentTarget.dataset.item
    let action = event.target.dataset.action
    if (action) {
      item.action = action
      app.storage.setItem('lv2-order-car-check', item)
      app.navigateTo('car-check')
    }
  },
  // 预览图片
  previewImage: function (event) {
    if (!event.target.id) return
    let images = event.currentTarget.dataset.images
    wx.previewImage({
      current: event.target.id,
      urls: images
    })
  },
  // 换车审核通过/不通过
  examineCar: function (event) {
    let carId = event.currentTarget.dataset.id
    let action = event.target.dataset.action
    if(!action)  return

    let url = action == 1 ? app.config.lv2.carChange1 : app.config.lv2.carChange2
    wx.showLoading()
    app.post(url, { carId }).then(_ => {
      app.storage.setItem('lv2-order-list-refresh', 1)
      app.toast('操作成功', false).then(_ => {
        this.getCarFrame()
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 协商价格
  carEditPrice: function (event) {
    let item = event.currentTarget.dataset.item
    let formData = app.utils.copyObj({
      id: '',
      familyId: '',
      carsId: '',
      carsName: '',
      guidePrice: '',
      colorId: '',
      colorName: '',
      interiorId: '',
      interiorName: '',
      carNum: '',
      depositPrice: '',
      finalPrice: '',
      isDiscount: this.data.info.changePrice < 0 ? 1 : 0,
      changePrice: '',
      remark: '',
      nakedPrice: '', // 裸车价
      trafficCompulsoryInsurancePrice: '', //交强险
      commercialInsurancePrice: '' // 商业险
    }, this.data.info)

    formData.changePrice = Math.abs(this.data.info.changePrice)
    app.storage.setItem('lv2-order-car-price', formData)
    app.navigateTo(`price?id=${this.data.info.id}`)
  },
  // 票证
  showTicket: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('lv2-order-ticket', item)
    app.navigateTo('ticket')
  }
})