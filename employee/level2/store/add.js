// level2/customer/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    regionName: '',
    formData: {
      orgId: '',
      shortName: '',
      linkMan: '',
      telePhone: '',
      provinceId: '',
      provinceName: '',
      cityId: '',
      cityName: '',
      areaId: '',
      areaName: '',
      address: '',
      longitude: '',
      latitude: '',
      remarks: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-customer-info').then(info => {
      if (info) {
        wx.setNavigationBarTitle({ title: '修改汽贸店信息' })
        let formData = app.utils.copyObj(this.data.formData, info)
        this.setData({ 
          formData,
          'regionName': info.provinceName === info.cityName ? (info.provinceName + info.areaName) : (info.provinceName + info.cityName + info.areaName)
        })
      } else {
        wx.setNavigationBarTitle({ title: '新增汽贸店' })
      }
    })
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
    let value = event.detail.value

    switch (id) {
      case 'telePhone':
        value = value.replace(/[^\d]/g, '')
        break
    }
    
    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 选择省市区
  onRegion: function (area, city, province) {
    if (area && city && province) {
      this.setData({
        'formData.provinceId': province.value,
        'formData.provinceName': province.text,
        'formData.cityId': city.value,
        'formData.cityName': city.text,
        'formData.areaId': area.value,
        'formData.areaName': area.text,
        'regionName': province.text === city.text ? 
          (province.text + area.text) : (province.text + city.text + area.text)
      })
    }
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.shortName) {
      this.showTopTips('请输入门店名称')
      return
    }
    if (!this.data.formData.linkMan) {
      this.showTopTips('请输入联系人姓名')
      return
    }
    if (!this.data.formData.telePhone) {
      this.showTopTips('请输入联系电话')
      return
    }
    if (this.data.formData.telePhone.length !== 11) {
      this.showTopTips('联系电话必须为11位手机号码')
      return
    }
    if (!(this.data.formData.provinceId && this.data.formData.cityId && this.data.formData.areaId)) {
      this.showTopTips('请选择门店地址')
      return
    }
    if (!this.data.formData.address) {
      this.showTopTips('请输入详细地址')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.lv2.storeAdd, this.data.formData).then(({ data }) => {
      if (this.data.formData.orgId) {
        app.storage.setItem('lv2-customer-info', this.data.formData)
        app.storage.setItem('lv2-customer-info-refresh', 1)
      }else{
        app.storage.setItem('lv2-customer-list-refresh', 1)
      }
      app.toast('保存成功', true)
      
    }).catch(err => {
      wx.hideLoading()
    })
  }
})