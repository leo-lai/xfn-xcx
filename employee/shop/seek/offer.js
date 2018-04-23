// shop/seek/offer.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    formData: {
      offerAmount: '',
      overdueDate: '',
      location: '',
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
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
  // 选择区域
  onRegion: function (area, city, province) {
    if (area && city && province) {
      this.setData({
        'formData.provinceId': province.value,
        'formData.provinceName': province.text,
        'formData.cityId': city.value,
        'formData.cityName': city.text,
        'formData.areaId': area.value,
        'formData.areaName': area.text,
        'formData.location': city.text,
      })
    }
  },
  submit: function () {
    if (!this.data.formData.location) {
      this.showTopTips('请选择车辆所在地')
      return
    }
    if (!this.data.formData.overdueDate) {
      this.showTopTips('请选择报价有效期')
      return
    }
    if (!(Number(this.data.formData.offerAmount) > 0)) {
      this.showTopTips('请填写报价金额')
      return
    }

    this.data.formData.findCarId = this.options.id
    wx.showLoading({ 
      mask: true,
      title: '报价中'
    })
    app.post(app.config.shop.seekOffer, this.data.formData).then(({ data }) => {
      app.storage.setItem('shop-seek-list-refresh', 1)
      app.toast('报价成功', false).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getInfo && prevPage.getInfo()
          app.back()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})