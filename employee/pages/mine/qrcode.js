// pages/mine/qrcode.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: ''
  },

  onReady: function (options) {
    app.onLogin(userInfo => {
      this.setData({ qrcode: userInfo.weixinQrImage || '' })
    }, this.route)
  },

  // 选择图片
  chooseImage: function (event) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 上传图片到服务器
        wx.showLoading({
          title: '照片上传中'
        })
        wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFiles[0].path,
          name: 'img_file',
          success: res => {
            if (res.statusCode === 200) {
              if (typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }

              this.setData({ qrcode: res.data.data })
              
              this.submit()
            } else {
              wx.showToast({
                image: '../../images/error.png',
                title: '上传失败(' + res.statusCode + ')'
              })
            }
          },
          fail: res => {
            wx.showToast({
              image: '../../images/error.png',
              title: '照片上传失败'
            })
          }
        })
      }
    })
  },

  // 保存二维码
  submit: function() {
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    app.post(app.config.wxQrImage, {
      weixinQrImage: this.data.qrcode
    }).then(_ => {
      app.updateUserInfo({ weixinQrImage: this.data.qrcode })
      app.toast('保存成功', true)
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})