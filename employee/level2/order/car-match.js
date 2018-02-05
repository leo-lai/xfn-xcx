// level2/order/car-match.js
const app = getApp()
Page({

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

    app.storage.getItem('lv2-order-car-info').then(info => {
      if (info) {
        this.setData({ info })
        this.getCarFrame()
      }
    })
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
        'carFrame': data.filter(item => item.vin).map(item => {
          item.checkImages = item.checkCarPic ? item.checkCarPic.split(',') : []
          return item
        }) 
      })
    }).finally(_ => {
      // wx.hideLoading()
      this.getFrameList()
    })
  },
  // 获取车架号列表
  getFrameList: function () {
    wx.showLoading()
    app.post(app.config.lv2.frameList, {
      infoId: this.data.info.id
    }).then(({ data }) => {
      this.setData({
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
      // this.showTopTips('请选择车架号')
      wx.showModal({
        content: '请选择车架号',
        showCancel: false
      })
      return
    }

    if (this.data.frameList.slted.length > this.data.info.carNum) {
      // this.showTopTips('出库车辆不能大于订车数量')
      wx.showModal({
        content: '出库车辆不能大于订车数量',
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
        app.getPrevPage().then(prevPage => prevPage.getInfo && prevPage.getInfo())
      })
    }).finally(_ => {
      this.setData({ 'frameList.loading': true })
    })
  },
  // 验车
  carCheck: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('lv2-order-car-check', item)
    app.navigateTo('car-check')
  }
})