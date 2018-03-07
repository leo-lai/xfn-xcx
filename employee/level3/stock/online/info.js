// level3/stock/online/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    online: ['下架', '在售'],
    formData: {
      orgCarsConfigureId: '',
      carsId: '',
      carsName: '',
      colourId: '',
      guidingPrice: '',
      discountPrice: '',
      depositPrice: '',
      isOnLine: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.params = {
        ids: options.ids ? options.ids.split(',') : ['', '', '']
      }
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({
      topTips
    })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({
        topTips: ''
      })
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
        default:
          value = this.data[picker].list[value]
          if (app.utils.isObject(value)) {
            value = value.name
          }
          break
      }
    }

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 库存详情
  getInfo: function () {
    wx.showNavigationBarLoading()
    app.post(app.config.carOnlineInfo, {
      orgCarsConfigureId: this.options.id,
      rows: 1000
    }).then(({ data }) => {
      data.guidingPriceStr = (data.guidingPrice / 10000).toFixed(2) + '万'
      this.setData({
        'info': data,
        'formData': app.utils.copyObj(this.data.formData, data)
      })
    }).finally(_ => {
      wx.hideNavigationBarLoading()
    })
  },
  // 查看验车照片
  viewImages: function (event) {
    wx.previewImage({
      urls: event.currentTarget.dataset.item.stockCarImages.split(',')
    })
  },
  submit: function () {
    if (!this.data.formData.carsId) {
      this.showTopTips('请选择车辆')
      return
    }
    if (!this.data.formData.colourId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (this.data.formData.discountPrice === '') {
      this.showTopTips('请填写优惠金额')
      return
    }
    // if (this.data.formData.depositPrice === '') {
    //   this.showTopTips('请填写默认收取定金')
    //   return
    // }

    wx.showLoading({ mask: true })
    app.post(app.config.carStockAdd, this.data.formData).then(({ data }) => {
      app.toast('修改成功')
      app.getPrevPage().then(prevPage => {
        prevPage.getList()
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})