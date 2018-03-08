//app.js
import utils from '/script/utils'
import config from 'config'

const noopFn = function () { }
// 缓存函数
const storage_prefix = 'express_'
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
    wx.navigateTo({ url: event.currentTarget.dataset.url })
  }
}
// 返回
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
    // storage.getItem('userInfo').then(userInfo => {
    //   this.globalData.userInfo = userInfo
    // })
  },
  ajax: function (type = 'JSON', url = '', formData = {}, showErr = true) {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        formData.sessionId = this.globalData.userInfo.sessionId
      } else {
        delete formData.sessionId
      }

      let reqParams = {
        url,
        method: 'POST',
        data: formData,
        header: {
          'content-type': type === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json'
        }
      }

      wx.request({
        ...reqParams,
        success: ({ data }) => {
          if (data.resultCode === 200) {
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
            content: data.message || '服务器繁忙，请稍后再试。'
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
  // post 表单请求
  post: function (url = '', formData = {}, showErr = true) {
    return this.ajax('POST', url, formData, showErr = true)
  },
  // post JSON请求
  json: function (url = '', formData = {}, showErr = true) {
    return this.ajax('JSON', url, formData, showErr = true)
  },
  // 检测是否登录
  checkLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      } else {
        storage.getItem('userInfo').then(userInfo => {
          this.globalData.userInfo = userInfo
          if (userInfo) {
            resolve(userInfo)
          } else {
            this.logout()
            reject('未登录状态')
          }
        }).catch(_ => {
          this.logout()
          reject('未登录状态')
        })
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
    loginCbs: {}  // 页面登录回调
  }
})