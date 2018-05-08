// share/sucai/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    uploadImages: [],
    formData: {
      materialId: '',
      materialName: '',
      image: '',
      remarks: ''
    }
  },
  onReady: function (options) {
    
  },
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('sucai-info').then(info => {
        if(info) {
          this.setData({
            'uploadImages': info.image ? info.image.split(',').map(item => {
              return {
                path: item,
                src: item,
                done: true,
                loading: false,
                progress: 100,
                tick: Date.now()
              }
            }) : [],
            formData: app.utils.copyObj(this.data.formData, info)
          })
        }
      })
    })
  },
  onUnload: function () {
    app.storage.removeItem('sucai-info')
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
    let picker = event.target.dataset.picker
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

              console.log(item)
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
    if (!this.data.formData.materialName) {
      this.showTopTips('请填写素材名称')
      return
    }
    if (this.data.uploadImages.length == 0) {
      this.showTopTips('请上传海报素材')
      return
    }

    let formData = Object.assign({}, this.data.formData)

    formData.image = this.data.uploadImages.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.share.sucaiAdd, formData).then(({ data }) => {
      app.storage.setItem('share-sucai-list-refresh', 1)
      app.toast('保存成功').then(_ => {
        app.getPrevPage().then(prevPage => {
          if (!formData.materialId) { // 新增
            prevPage.getList && prevPage.getList()
          } else {
            prevPage.getInfo && prevPage.getInfo()
          }
          app.back()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})