//app.js
// 检查新版本，立即更新
if (wx.getUpdateManager) {
  const updateManager = wx.getUpdateManager()
  updateManager.onCheckForUpdate(function (res) {
    if (res.hasUpdate) {
      console.log('有新版可下载...')
    }
  })
  updateManager.onUpdateReady(function () {
    console.log('新的版本已经下载好，重启应用新版本')
    wx.showModal({
      title: '温馨提示',
      content: '系统已发布新版本，可以更新使用咯~',
      showCancel: false,
      confirmText: '重启更新',
      success: res => {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })
  updateManager.onUpdateFailed(function () {
    console.log('新的版本下载失败')
  })
}

import utils from '/script/utils'
import config from 'config'

const noopFn = function () { }

// 缓存函数
const storage_prefix = 'customer_'
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
const back = (delta = 1) => {
  wx.navigateBack({ delta })
}
// 提示
let toastTimeid = 0
const toast = (msg, isBack) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      icon: 'success',
      title: msg
    })
    clearTimeout(toastTimeid)
    toastTimeid = setTimeout(_ => {
      isBack && back()
      resolve()
    }, 1500)
  })
}
// 获取上一页
const getPrevPage = _ => {
  return new Promise((resolve, reject) => {
    let currentPages = getCurrentPages()
    if (currentPages.length > 1) {
      resolve(currentPages[currentPages.length - 2])
    } else {
      reject('没有上一页了')
    }
  })
}

App({
  utils, config, storage, noopFn, toast, navigateTo, back, getPrevPage,
  onLaunch: function () {
    // 获取用户信息
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
            storage.removeItem('userInfo')
           
            if(++this.globalData.loginTimes < 3){
              this.login() // 重新登录
            }
            return reject('登录失效')
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
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      } else {
        reject('未登录状态')
        this.login()
      }
    })
  },
  // 登录，获取用户信息
  login: function () {
    return new Promise((resolve, reject) => {
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
              this.post(config.login, formData).then(apiRes => {
                if (apiRes.data) {
                  wx.hideLoading()
                  // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处触发回调函数
                  this.updateUserInfo(apiRes.data)
                }
                resolve(apiRes)
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
  updateUserInfo: function (userInfo = {}, isCallback = true) {
    if(userInfo.avatarUrl) {
      userInfo.avatarThumb = utils.formatHead(userInfo.avatarUrl)  
    }
    this.globalData.userInfo = Object.assign({}, this.globalData.userInfo, userInfo)
    storage.setItem('userInfo', this.globalData.userInfo)
    isCallback && this.runLoginCbs(this.globalData.userInfo)
  },
  runLoginCbs: function (userInfo) {
    getCurrentPages().forEach(page => {
      this.globalData.loginCbs[page.route] && this.globalData.loginCbs[page.route].call(this, userInfo)
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