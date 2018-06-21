// pages/login/change.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.storage.getItem('login_list').then(data => {
      console.log(data)
      this.setData({
        list: data
      })
    })
  },

  // 登录
  login: function(event) {
    let index = event.currentTarget.dataset.index

    let formData = this.data.list[index]
    wx.showLoading({ mask: true })
    app.post(app.config.auth.login, formData).then(({ data }) => {
      // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处触发回调函数
      app.storage.getItem('login_list').then(loginList => {
        loginList = loginList || []

        let loginInfo = {
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          orgName: data.orgName,
          headPortrait: data.headPortrait,
          nikeName: data.nikeName,
        }

        if (loginList.filter(item => item.phoneNumber == loginInfo.phoneNumber).length > 0) {
          loginList = loginList.map(item => {
            return item.phoneNumber == loginInfo.phoneNumber ? loginInfo : item
          })
        } else {
          loginList.push(loginInfo)
        }
        app.storage.setItem('login_list', loginList)
      })

      app.updateUserInfo(data)

      app.toast('登录成功', false).then(_ => {
        app.back(this.options.delta ? Number(this.options.delta) : 1)
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})