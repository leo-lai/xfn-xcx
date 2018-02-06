// level2/order/wuliu.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    formData: {
      orderId: '',
      logisticsOrderCode: '',
      logisticsCompany: '',
      logisticsPlateNumber: '',
      logisticsDriver: '',
      logisticsDriverPhone: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-order-wuliu').then(info => {
      if (info) {
        this.setData({
          'formData': Object.assign({}, this.data.formData, info)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  onUnload: function () {
    app.storage.removeItem('lv2-order-wuliu')
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
    let picker = event.target.dataset.picker
    let value = event.detail.value

    data['formData.' + id] = value
    this.setData(data)
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.logisticsOrderCode) {
      this.showTopTips('请输入物流单号')
      return
    }
    if (!this.data.formData.logisticsCompany) {
      this.showTopTips('请输入物流公司名称')
      return
    }
    if (!this.data.formData.logisticsPlateNumber) {
      this.showTopTips('请输入运输车车牌号')
      return
    }
    if (!this.data.formData.logisticsDriver) {
      this.showTopTips('请输入司机姓名')
      return
    }
    if (!this.data.formData.logisticsDriverPhone) {
      this.showTopTips('请输入联系电话')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.lv2.wuliu, this.data.formData)
    .then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getList && prevPage.getList()
          prevPage.getInfo && prevPage.getInfo()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})