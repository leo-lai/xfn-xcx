// share/share/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noopFn: app.noopFn,
    share: {
      visible: false,
      data: null
    },
    info: null,
    userInfo: null
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
    app.checkLogin().then(_ => {
      this.getInfo()
    })
  },

  getInfo: function () {
    wx.showLoading()
    app.post(app.config.share.shareInfo, {
      materialInfoId: this.options.id
    }).then(({ data }) => {
      data.imageArr = data.materialVo.image ? data.materialVo.image.split(',') : []
      data.imageArr = data.imageArr.concat(data.image ? data.image.split(',') : [])
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  previewImage: function (event) {
    let urls = event.currentTarget.dataset.urls
    let current = event.target.id
    wx.previewImage({
      current, urls
    })
  },
  share: function (event) {
    let id = event.target.id
    wx.showLoading()
    app.ajax(app.config.share.shareLink, {
      id
    }).then(({ data }) => {
      this.setData({
        'share.visible': true,
        'share.data': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  closeShare: function () {
    this.setData({
      'share.visible': false
    })
  },
  shareImage: function () {
    wx.showLoading()
    wx.downloadFile({
      url: this.data.share.data,
      success: res => {
        this.saveImage(res.tempFilePath).then(_ => {
          this.closeShare()
        }).finally(_ => {
          wx.hideLoading()
        })
      },
      fail: res => {
        wx.hideLoading()
        wx.showToast({
          image: '../../images/error.png',
          title: '下载图片失败'
        })
      }
    })
  },
  // 保存到相册
  saveImage: function (filePath = '') {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: res => {
          resolve()
          wx.showModal({
            title: '成功保存图片',
            content: '已成功为您保存图片到手机相册，请自行前往微信朋友圈分享',
            showCancel: false,
            confirmText: '知道了'
          })
        },
        fail: res => {
          console.log(res)
          // 用户不授权弹出重新授权页面
          if (res.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
            wx.showModal({
              title: '授权失败',
              content: '小程序需要访问手机相册权限',
              confirmText: '去授权',
              success: res => {
                if (res.confirm) {
                  wx.openSetting({
                    success: res => {
                      if (res.authSetting['scope.writePhotosAlbum']) {
                        this.saveImage(filePath)
                      }
                    }
                  })
                } else {
                  reject()
                }
              }
            })
          } else {
            reject('保存图片失败')
            if (res.errMsg !== 'saveImageToPhotosAlbum:fail cancel') {
              wx.showToast({
                image: '../../images/error.png',
                title: '保存图片失败'
              })
            }
          }
        }
      })
    })

  },
})