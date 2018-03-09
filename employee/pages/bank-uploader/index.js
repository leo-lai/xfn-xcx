// pages/car-uploader/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    avatar: app.config.avatar,
    uploadImages: [],
    uploadVideo: {},
    formData: {
      customerUsersId: '',
      bankAuditsImage: '',
      bankAuditsvideo: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.data.formData.customerUsersId = options.id
      app.storage.getItem('bankInfo').then(bankInfo => {
        if (bankInfo) {
          this.setData({
            'uploadImages': bankInfo.bankAuditsImage ? bankInfo.bankAuditsImage.split(',').map(item => {
              return {
                path: item,
                src: item,
                done: true,
                loading: false,
                progress: 100,
                tick: Date.now()
              }
            }) : [],
            'uploadVideo.path': bankInfo.bankAuditsvideo
          })
        }
      })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({
      topTips
    })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({
        topTips: ''
      })
    }, 3000)
  },
  // 选择图片
  chooseImage: function (event) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let images = this.data.uploadImages
        let resImage = res.tempFiles.map(item => {
          item.src = ''
          item.done = false
          item.loading = true
          item.progress = 0
          item.tick = Date.now()
          // 上传图片到服务器
          item.uploadTask = wx.uploadFile({
            url: app.config.uploadFile,
            filePath: item.path,
            name: 'img_file',
            success: res => {
              if(typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }
              
              item.done = true
              item.loading = false
              item.progress = 100
              item.src = res.data.data
              item.uploadTask = null
              this.syncView(item)
            },
            fail: res => {
              item.done = false
              item.loading = false
              this.syncView(item)
            }
          })
          // 上传进度
          item.uploadTask.onProgressUpdate(res => {
            if (res.progress < 100) {
              item.progress = res.progress
              this.syncView(item)
            }
          })
          return item
        })

        this.setData({
          'uploadImages': images.concat(resImage)
        })
      }
    })
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.uploadImages.map(item => item.path) // 需要预览的图片http链接列表
    })
  },
  longDelImage: function (event) {
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#fa5539',
      success: res => {
        if (res.tapIndex === 0) {
          let leftImages = this.data.uploadImages.filter(item => {
            if (item.tick === event.currentTarget.dataset.val){
              item.uploadTask && item.uploadTask.abort()
              return false
            }
            return true
          })
          this.setData({
            'uploadImages': leftImages
          })
        }
      }
    })
  },
  // 同步视图
  syncView: function (objectItem = {}, key = 'tick') {
    if (!objectItem[key]) return

    for (let i = this.data.uploadImages.length - 1; i >= 0; i--) {
      if (this.data.uploadImages[i][key] === objectItem[key]) {
        this.data.uploadImages[i] = objectItem
        this.setData({
          'uploadImages': this.data.uploadImages
        })
        break
      }
    }
  },
  // 选择视频
  chooseVideo: function () {
    this.data.uploadVideo.uploadTask && this.data.uploadVideo.uploadTask.abort()
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: res => {
        let video = {
          done: false,
          fail: false,
          loading: true,
          progress: 0,
          path: res.tempFilePath
        }
        // 上传视频到服务器
        video.uploadTask = wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFilePath,
          name: 'img_file',
          success: res => {
            if (typeof res.data === 'string') {
              res.data = JSON.parse(res.data)
            }

            video.done = true
            video.fail = false
            video.loading = false
            video.progress = 100
            video.uploadTask = null
            video.src = res.data.data

            this.setData({ 'uploadVideo': video })
          },
          fail: res => {
            video.done = false
            video.loading = false
            video.fail = true
            this.setData({ 'uploadVideo': video })
          }
        })
        // 上传进度
        video.uploadTask.onProgressUpdate(res => {
          video.progress = res.progress
          this.setData({ 'uploadVideo': video })
        })
      }
    })
  },
  submit: function() {
    if (this.data.uploadImages.length === 0) {
      this.showTopTips('请上传资料照片')
      return
    }

    if(this.data.uploadImages.filter(item => item.loading).length > 0) {
      this.showTopTips('请等待资料照片上传完毕')
      return
    }

    if (!this.data.uploadVideo.path) {
      this.showTopTips('请上传签名视频')
      return
    }

    if (this.data.uploadVideo.loading) {
      this.showTopTips('请等待签名视频上传完毕')
      return
    }

    this.data.formData.bankAuditsImage = this.data.uploadImages.map(item => item.src).join(',')
    this.data.formData.bankAuditsvideo = this.data.uploadVideo.src

    wx.showLoading()
    app.post(app.config.customerUpload, this.data.formData).then(_ => {
      app.getPrevPage().then(prevPage => {
        prevPage.setData({
          'info.bankAuditsImage': this.data.formData.bankAuditsImage,
          'info.bankAuditsvideo': this.data.formData.bankAuditsvideo
        })
      })
      app.toast('上传成功', true)
    }).catch(_ => {
      wx.hideLoading()
    })

  }
})