// level2/order/car-check.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    action: 1,
    avatar: app.config.avatar,
    uploadImages: [],
    formData: {
      carId: '',
      checkCarPic: '',
      auditRemark: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      app.storage.getItem('lv2-order-car-check').then(info => {
        if (info) {
          wx.setNavigationBarTitle({ title: info.action == 2 ? '换车申请' : '验车'})
          this.setData({
            'action': info.action,
            'formData.carId': info.id,
            'formData.checkCarPic': info.checkCarPic,
            'uploadImages': info.checkCarPic ? info.checkCarPic.split(',').map(item => {
              return {
                path: item,
                src: item,
                done: true,
                loading: false,
                progress: 100,
                tick: app.utils.guid()
              }
            }) : []
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
  // 表单输入
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let value = event.detail.value

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
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
              if (typeof res.data === 'string') {
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
            if (item.tick === event.currentTarget.dataset.val) {
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
  submit: function () {
    if (this.data.uploadImages.length === 0) {
      this.showTopTips('请上传验车照片')
      return
    }

    if (this.data.uploadImages.filter(item => item.loading).length > 0) {
      this.showTopTips('请等待验车照片上传完毕')
      return
    }
    this.data.formData.checkCarPic = this.data.uploadImages.map(item => item.src).join(',')

    let url = app.config.lv2.carCheck
    if(this.data.action == 2) {
      url = app.config.lv2.carChange
      if (!this.data.formData.auditRemark) {
        this.showTopTips('请输入申请换车理由')
        return
      }
    }

    wx.showLoading()
    app.post(url, this.data.formData).then(_ => {
      app.toast('操作成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getCarFrame && prevPage.getCarFrame()
        })  
      })
    }).catch(_ => {
      wx.hideLoading()
    })

  }
})