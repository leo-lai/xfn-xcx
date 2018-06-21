// pages/mine-pwd/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    formData: {
      passwordOld: '',
      password: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    data['formData.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  // 更改
  submit() {
    if (!this.data.formData.passwordOld) {
      this.showTopTips('请输入旧密码')
      return
    }
    if (!this.data.formData.password) {
      this.showTopTips('请输入新密码')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.password, this.data.formData).then(({ data }) => {
      // app.updateUserInfo({ sessionId: data.sessionId })
      wx.hideLoading()
      wx.showModal({
        content: '修改密码成功，请重新登录',
        showCancel: false,
        confirmText: '去登录',
        // confirmColor: '#fa5539',
        success: res => {
          wx.redirectTo({
            url: '/pages/login/index',
          })
        }
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})