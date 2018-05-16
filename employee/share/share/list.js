// share/share/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  data: {
    share: {
      visible: false,
      data: null
    },
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: ''
      }
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      rows: 50,
      data: []
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getList()
    }, this.route)
  },
  onShow: function () {
    app.checkLogin()
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (app.globalData.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 分享列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.post(app.config.share.shareList, {
      page, ...this.data.filter.data,
      rows: this.data.list.rows
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.imageArr = item.image ? item.image.split(',') : []
        item.imageArr = item.imageArr.concat(item.materialVo.image ? item.materialVo.image.split(',') : [])
        item.materialName = item.materialVo.materialName
        item.thumb = app.utils.formatThumb(item.imageArr[0], 150)
        return item
      })

      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  },
  share: function (event) {
    let id = event.target.id
    wx.showLoading()
    app.ajax(app.config.share.shareLink, {
      id
    }).then(({data}) => {
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
        console.log(res)
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
                }else{
                  reject()
                }
              }
            })
          } else {
            reject('保存图片失败')
            if (res.errMsg !== 'saveImageToPhotosAlbum:fail cancel'){
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

  // 搜索相关=================================================
  // 正在输入
  filterTyping(event) {
    event.detail.value === '' && this.setData({ 'list.ajax': false })
    this.setData({ 'filter.data.keywords': event.detail.value })
    clearTimeout(this.typingId)
    this.typingId = setTimeout(this.search, 1000)
  },
  // 清楚输入
  clearTyping() {
    this.setData({ 'filter.data.keywords': '' })
    this.search()
  },
  // 搜索
  search: function () {
    clearTimeout(this.typingId)
    wx.showLoading()
    this.getList().finally(_ => {
      wx.hideLoading()
    })
  }
})