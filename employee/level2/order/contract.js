// level2/order/contract.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    wuliu: app.config.baseData.wuliu,
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getInfo()
  },
  onShareAppMessage: function() {
    return {
      title: '购车电子合同'
    }
  },
  // 资源订单详情
  getInfo: function () {
    wx.showLoading()
    app.ajax(app.config.consumer.orderInfo, {
      id: this.options.id
    }).then(({ data }) => {
      data.createTimeStr = app.utils.str2date(data.createTime).format('yyyy年MM月dd日')
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
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
            title: '成功保存电子合同',
            content: '已成功为您保存电子合同到手机相册，请到手机相册查看',
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
            reject('保存电子合同失败')
            if (res.errMsg !== 'saveImageToPhotosAlbum:fail cancel') {
              wx.showToast({
                image: '../../images/error.png',
                title: '保存电子合同失败'
              })
            }
          }
        }
      })
    })

  },
  submit: function () {
    wx.showLoading()
    app.ajax(app.config.consumer.contractImage, {
      orderId: this.options.id
    }).then(({ data }) => {
      wx.downloadFile({
        url: data,
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
            title: '下载电子合同失败'
          })
        }
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})