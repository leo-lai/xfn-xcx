// level2/stock/in/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    carSource: ['资源采购', '4S店出货'],
    uploadImages: [],
    sales: { // 供应商
      index: -1,
      list: []
    },
    supplier: { // 采购人员
      index: -1,
      list: []
    },
    formData: {
      storageId: '',
      storageSource: '',
      supplierId: '',
      systemUserId: '',
      logisticsCost: '',
      remarks: '',
      contractImage: ''
    }
  },
  onReady: function (options) {
    app.onLogin(userInfo => {
      this.getSupplier()
      this.getSales()
    }, this.route)
  },
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
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      switch (id) {
        case 'supplierId':
          value = this.data[picker].list[value].id
          break
        case 'systemUserId':
          value = this.data[picker].list[value][id]
          break
        default:
          value = this.data[picker].list[value]
          if (app.utils.isObject(value)) {
            value = value.name
          }
          break
      }
    }

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  getSupplier: function () { // 获取供应商列表
    app.ajax(app.config.stock.supplierList).then(({ data }) => {
      this.setData({
        'supplier.index': -1,
        'supplier.list': data
      })
    })
  },
  getSales: function () { // 获取采购员列表
    app.post(app.config.buyerList).then(({ data }) => {
      this.setData({
        'sales.index': -1,
        'sales.list': data
      })
    })
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
    if (!this.data.formData.storageSource) {
      this.showTopTips('请选择车辆来源')
      return
    }
    if (!this.data.formData.supplierId) {
      this.showTopTips('请选择供应商')
      return
    }
    if (!this.data.formData.systemUserId) {
      this.showTopTips('请选择采购员')
      return
    }

    let formData = Object.assign({}, this.data.formData)

    formData.storageSource = Number(this.data.formData.storageSource) + 1
    formData.contractImage = this.data.uploadImages.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.stockInAdd, formData).then(({ data }) => {
      app.getPrevPage().then(prevPage => {
        prevPage.getList()
      })
      app.toast('提交成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})