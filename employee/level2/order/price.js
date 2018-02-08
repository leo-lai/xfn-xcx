// level2/order/price.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    formData: {
      orderId: '',
      customerId: '',
      id: '',
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
      isDiscount: 1,
      changePrice: '',
      remark: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-order-car-price').then(info => {
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
    app.storage.removeItem('lv2-order-car-price')
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

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      switch (id) {
        case 'colorId':
          data['formData.colorName'] = this.data[picker].list[value].carColourName
          value = this.data[picker].list[value].carColourId

          break
        case 'interiorId':
          data['formData.interiorName'] = this.data[picker].list[value].interiorName
          value = this.data[picker].list[value].interiorId
          break
        case 'orgId':
          value = this.data[picker].list[value][id]
          break
        default:
          value = this.data[picker].list[value]
          break
      }
    }
    console.log(id, value)
    switch (id) {
      case 'userName':
      case 'userPhone':
        data['customerInfo.' + id] = value
        break
      default:
        data['formData.' + id] = value
    }
    this.setData(data)
  },
  // 保存信息
  submit: function () {
    
    if (!(this.data.formData.finalPrice > 0)) {
      this.showTopTips('请输入成交价')
      return
    }
    
    let formData = app.utils.copyObj({
      infoId: this.options.id,
      finalPrice: '',
      remark: ''
    }, this.data.formData)

    wx.showLoading({ mask: true })
    app.post(app.config.lv2.changeCarPrice, formData)
      .then(({ data }) => {
        app.toast('修改成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            prevPage.getCarFrame()
          })
        })
      }).catch(err => {
        wx.hideLoading()
      })
  }
})