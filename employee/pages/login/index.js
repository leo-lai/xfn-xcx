// pages/login/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: {
      banner: app.config.resURL + '/employee/login-banner.jpg'
    },
    topTips: '',
    remember: true,
    formData: {
      nikeName: '',
      phoneNumber: '',
      password: '',
      headPortrait: '',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.storage.getItem('phoneNumber').then(val => {
      if(val) {
        this.setData({
          'formData.phoneNumber': val
        })
      }
    })
    // this.getLoginInfo()
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
    data['formData.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  rememberChange: function() {
    this.setData({
      remember: !this.data.remember
    })
  },
  getLoginInfo: function(res) {
    if (res.detail.errMsg === 'getUserInfo:ok'){
      this.data.formData.rawData = res.detail.rawData
      this.data.formData.signature = res.detail.signature
      this.data.formData.encryptedData = res.detail.encryptedData
      this.data.formData.iv = res.detail.iv
      this.data.formData.nikeName = res.detail.userInfo.nickName
      this.data.formData.headPortrait = res.detail.userInfo.avatarUrl
      this.submit()
    }
    // if (this.data.formData.code) {
    //   this.submit()
    //   return
    // }
    // wx.login({
    //   success: loginRes => { // 获取授权code，可以到后台换取 openId, sessionKey, unionId
    //     wx.getUserInfo({ // 小程序授权获取用户信息（头像，昵称等）
    //       withCredentials: true,
    //       success: userInfoRes => { // 可以将 userInfoRes 发送给后台解码出 unionId
    //         this.data.formData.code = loginRes.code
    //         this.data.formData.rawData = userInfoRes.rawData
    //         this.data.formData.signature = userInfoRes.signature
    //         this.data.formData.encryptedData = userInfoRes.encryptedData
    //         this.data.formData.iv = userInfoRes.iv
    //         this.data.formData.nikeName = userInfoRes.userInfo.nickName
    //         this.data.formData.headPortrait = userInfoRes.userInfo.avatarUrl

    //         this.submit()
    //       },
    //       fail: res => {
    //         console.log(res)
    //         if (res.errMsg !== 'getUserInfo:fail scope unauthorized') {
    //           // 用户不授权弹出重新授权页面
    //           wx.showModal({
    //             title: '授权失败',
    //             content: '小程序需要您的登录授权',
    //             confirmText: '去授权',
    //             success: res => {
    //               if (res.confirm) {
    //                 wx.openSetting({
    //                   success: res => {
    //                     if (res.authSetting['scope.userInfo']) {
    //                       this.getLoginInfo()
    //                     }
    //                   }
    //                 })
    //               }
    //             }
    //           })
    //         }
    //       }
    //     })
    //   }
    // })
  },
  // 登录
  submit: function() {
    let formData = this.data.formData

    if (!formData.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }
    if (!formData.password) {
      this.showTopTips('请输入密码')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.auth.login, formData).then(({data}) => {
      // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处触发回调函数
      app.storage.setItem('phoneNumber', formData.phoneNumber)
      app.storage.getItem('login_list').then(loginList => {
        loginList = loginList || []

        let loginInfo = {
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          orgName: data.orgName,
          headPortrait: data.headPortrait,
          nikeName: data.nikeName,
        }

        if (this.data.remember) {
          if (loginList.filter(item => item.phoneNumber == loginInfo.phoneNumber).length > 0) {
            loginList = loginList.map(item => {
              return item.phoneNumber == loginInfo.phoneNumber ? loginInfo : item
            })
          } else {
            loginList.push(loginInfo)
          }
        }else{
          loginList = loginList.filter(item => item.phoneNumber != loginInfo.phoneNumber)
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