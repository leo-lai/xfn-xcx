//app.js
import utils from '/script/utils'
import config from 'config'

const noop = function () { }
// 缓存函数
const storage_prefix = 'employee_'
const storage = {
  setItem: (key, value) => {
    try {
      wx.setStorageSync(storage_prefix + key, value)
    } catch (err) {
      console.error('本地存储信息失败' + err)
    }
  },
  getItem: key => {
    return new Promise((resolve, reject) => {
      try {
        let value = wx.getStorageSync(storage_prefix + key)
        resolve(value)
      } catch (err) {
        console.error('本地存储信息失败' + err)
        reject()
      }
    })
  },
  removeItem: key => {
    try {
      wx.removeStorageSync(storage_prefix + key)
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
// 提示
const toast = msg => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      icon: 'success',
      title: msg,
      duration: 2000
    })
    setTimeout(_ => {
      resolve()
    }, 2000)
  })
}

App({
  utils, config, storage, noop, toast, navigateTo,
  onLaunch: function () {
    storage.getItem('userInfo').then(userInfo => {
      this.globalData.userInfo = userInfo
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
            toast('登录失效').then(_ => {
              this.logout()
            })
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
  // 检测是否登录
  checkLogin() {
    return new Promise((resolve, reject) => {
      if(this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      }else {
        reject(null)
        this.logout()
      }
    })
  },
  // 登出
  logout: function () {
    this.globalData.userInfo = null
    storage.removeItem('userInfo')
    navigateTo('/pages/login/index')
  },
  // 更新用户信息
  updateUserInfo: function (userInfo = {}) {
    if (userInfo.headPortrait) {
      userInfo.avatarThumb = utils.formatHead(userInfo.headPortrait)
    }
    this.globalData.userInfo = Object.assign({}, this.globalData.userInfo, userInfo)
    storage.setItem('userInfo', this.globalData.userInfo)
    this.runLoginCbs(this.globalData.userInfo)
  },
  runLoginCbs: function (userInfo) {
    Object.keys(this.globalData.loginCbs).forEach(cbkey => {
      this.globalData.loginCbs[cbkey].call(this, userInfo)
    })
  },
  onLogin: function (callback, cbkey = new Date().getTime()) { // 页面监听登录事件
    if (typeof callback === 'function') {
      this.globalData.loginCbs[cbkey] = callback
      if (this.globalData.userInfo) {
        callback.call(this, this.globalData.userInfo)
      }
    }
  },
  globalData: {
    userInfo: null,
    loginCbs: {}, // 页面登录回调
    loginTimes: 0 // 登录失败次数
  }
})