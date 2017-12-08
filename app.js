//app.js
import utils from '/script/utils'
import config from 'config'

const noop = function () { }

// 缓存函数
const storage = {
  setItem: (key, value) => {
    try {
      wx.setStorageSync(key, value)
    } catch (err) {
      console.error('本地存储信息失败' + err)
    }
  },
  getItem: (key) => {
    return new Promise((resolve, reject) => {
      try {
        let value = wx.getStorageSync(key)
        resolve(value)
      } catch (err) {
        console.error('本地存储信息失败' + err)
        reject()
      }
    })
  },
  removeItem: (key) => {
    try {
      wx.removeStorageSync(key)
    } catch (err) {
      console.error('本地存储信息失败' + err)
    }
  }
}
// 跳转函数
const navigateTo = event => {
  if (typeof event === 'string') {
    wx.navigateTo({ url: event })
  } else if (typeof event === 'object') {
    wx.navigateTo({ url:  event.currentTarget.dataset.url })
  }
}

App({
  utils,
  config,
  storage,
  noop,
  navigateTo,
  onLaunch: function () {
    // 获取用户信息
    storage.getItem('userInfo').then(userInfo => {
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.runLoginCbs(userInfo)
      } else {
        this.login()
      }
    }).catch(() => {
      this.login()
    })
  },
  // post请求
  post: function (url = '', data = {}, showErr = true) {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        data.sessionId = this.globalData.userInfo.sessionId
      }else {
        delete data.sessionId
      }
      wx.request({
        url,
        data,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: ({ data }) => {
          if (data.resultCode === 200) {
            this.globalData.loginTimes = 0
            return resolve(data)
          }

          // session失效
          if (data.resultCode === 4002) {
            storage.removeItem('userInfo')
            if(++this.globalData.loginTimes < 3){
              return this.login() // 重新登录
            }
            return reject(data)
          }

          // 其他错误码处理
          switch (data.resultCode) {
            case 4008:
            case 4004:
            case 4005:
              break
          }

          wx.hideLoading()
          reject(data)

          showErr && wx.showModal({
            showCancel: false,
            content: data.message || '接口请求出错'
          })

        },
        fail: err => {
          wx.showModal({
            showCancel: false,
            content: err.errMsg || '接口请求出错'
          })
          reject(err)
        }
      })
    })
  },
  // 登录，获取用户信息
  login: function () {
    return new Promise((resolve, reject) => {
      const that = this
      wx.showLoading()
      wx.login({
        success: loginRes => { // 获取授权code，可以到后台换取 openId, sessionKey, unionId
          wx.getUserInfo({ // 小程序授权获取用户信息（头像，昵称等）
            withCredentials: true,
            success: userInfoRes => { // 可以将 userInfoRes 发送给后台解码出 unionId
              let formData = {
                code: '',
                rawData: '',
                signature: '',
                encryptedData: '',
                iv: ''
              }
              utils.copyObj(formData, userInfoRes, loginRes)
              that.post(config.login, formData).then((apiRes) => {
                resolve(apiRes)

                if (apiRes.data) {
                  wx.hideLoading()
                  apiRes.data.isDoctor = apiRes.data.isDoctor === 1 ? 1 : 0
                  apiRes.data.avatarThumb = utils.formatHead(apiRes.data.avatarUrl)
                  that.globalData.userInfo = apiRes.data
                  storage.setItem('userInfo', apiRes.data)

                  // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处触发回调函数
                  that.runLoginCbs.call(that, apiRes.data)
                }
              }).catch(err => {
                wx.hideLoading()
                reject(err)
              })
            },
            fail: err => {
              // 用户不授权弹出重新授权页面
              wx.hideLoading()
              reject(err)
              wx.showModal({
                title: '授权失败',
                content: '小程序需要您的登录授权',
                confirmText: '去授权',
                success: res => {
                  if(res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        if (res.authSetting['scope.userInfo']) {
                          this.login()
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        },
        fail: err => {
          wx.hideLoading()
          reject(err)
        }
      })
    })
  },
  // 刷新个人信息
  refreshUserInfo: function () {
    let promise = this.post(config.userInfo)
    wx.showNavigationBarLoading()
    promise.then(({ data }) => {
      this.updateUserInfo(data)
    }).finally(() => {
      wx.hideNavigationBarLoading()
    })
    return promise
  },
  updateUserInfo: function (userInfo = {}) {
    userInfo.avatarThumb = utils.formatHead(userInfo.avatarUrl)
    Object.assign(this.globalData.userInfo, userInfo)
    storage.setItem('userInfo', this.globalData.userInfo)
  },
  runLoginCbs: function (userInfo) {
    this.globalData.loginCbs.forEach(cb => {
      cb.call(this, userInfo)
    })
  },
  onLogin: function (callback) { // 页面监听登录事件
    if (typeof callback === 'function') {
      this.globalData.loginCbs.push(callback)
      if (this.globalData.userInfo) {
        callback.call(this, this.globalData.userInfo)
      }
    }
  },
  globalData: {
    userInfo: null,
    loginCbs: [], // 页面登录回调
    loginTimes: 0 // 登录失败次数
  }
})