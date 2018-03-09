// level3/stock/order/add.js
const app = getApp()
let todayStr = new Date().format('yyyy-MM-dd')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    cheshen: { // 车身颜色
      index: -1,
      list: []
    },
    neishi: { // 内饰颜色
      index: -1,
      list: []
    },
    carTime: app.config.baseData.carTime,
    uploadImages: [],
    formData: {
      carsId: '',
      carsName: '',
      guidingPrice: '',
      colourId: '',
      interiorId: '',
      stockOrderNumber: '',
      certificateDate: '',
      stockOrderRemarks: '',
      templateImage: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.storage.getItem('car-stock-order-info').then(info => {
      if (info) {
        let formData = app.utils.copyObj(this.data.formData, info)
        this.setData({ formData })
        this.getCheshen(info.familyId)
        this.getNeishi(info.familyId)
      }
    })
  },
  onUnload: function () {
    app.storage.removeItem('car-stock-order-info')
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
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      switch (id) {
        case 'colourId':
          value = this.data[picker].list[value].carColourId
          break
        case 'interiorId':
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
  // 选择车辆
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      this.setData({
        'formData.carsId': carType.id,
        'formData.carsName': carType.name,
        'formData.guidingPrice': carType.price,
        'formData.colourId': '',
        'formData.interiorId': ''
      })
      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    if (!familyId) return
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId === this.data.formData.colourId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    if (!familyId) return
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId === this.data.formData.interiorId),
        'neishi.list': data
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
    if (!this.data.formData.carsId) {
      this.showTopTips('请选择车辆')
      return
    }
    if (!this.data.formData.colourId) {
      this.showTopTips('请选择车身颜色')
      return
    }
    if (!this.data.formData.interiorId) {
      this.showTopTips('请选择内饰颜色')
      return
    }
    if (this.data.formData.stockOrderNumber <= 0) {
      this.showTopTips('请填写采购数量')
      return
    }
    if (!this.data.formData.certificateDate) {
      this.showTopTips('请选择合格证时间')
      return
    }

    let formData = Object.assign({}, this.data.formData)

    formData.certificateDate = Number(this.data.formData.certificateDate) + 1
    formData.templateImage = this.data.uploadImages.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.stockOrderAdd, formData).then(({ data }) => {
      app.getPrevPage().then(prevPage => {
        if (prevPage.route === 'pages/car-stock-order-list/index') {
          prevPage.getList()
        }
      })

      app.toast('提交订单成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})