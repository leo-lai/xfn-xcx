// shop/store/pay.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      orgId: '',
      allInPayMerchant: '',
      allInPayAppId: '',
      allInPaySecretKey: '',
    }
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
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('shop-store-info')
  },
  getInfo: function () {
    app.storage.getItem('shop-store-info').then(info => {
      if (info) {
        this.setData({
          'formData': app.utils.copyObj(this.data.formData, info)
        })
      }
    })
  },
  // 表单输入
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let picker = event.target.dataset.picker
    let value = event.detail.value

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 保存信息
  submit: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.shop.storePayInfo, this.data.formData).then(({ data }) => {
      app.storage.setItem('shop-store-list-refresh', 1)
      app.toast('保存成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})