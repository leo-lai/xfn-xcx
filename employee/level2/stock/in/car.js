// pages/car-stock-in-info/car.js
const app = getApp()
let todayStr = new Date().format('yyyy-MM-dd')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    showEdit: true,
    result: {
      visible: false
    },
    cheshen: { // 车身颜色
      index: -1,
      list: []
    },
    neishi: { // 内饰颜色
      index: -1,
      list: []
    },
    cang: { // 入库仓位
      index: -1,
      list: []
    },
    carParts: { // 选择随车资料
      list: []
    },
    strongInsurance: ['否', '是'],
    carTime: app.config.baseData.carTime,
    uploadImages: [],
    formData: {
      storageId: '',
      stockCarId: '',
      carsId: '',
      carsName: '',
      colourId: '',
      interiorId: '',
      unitPrice: '',
      frameNumber: '',
      engineNumber: '',
      factoryOut: '',
      certificateNumber: '',
      certificateDate: '',
      warehouseId: '',
      stockCarImages: '',
      mileage: '',
      followInformation: '',
      overStrongInsurance: 1
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(_ => {
      this.data.formData.storageId = this.options.id
      app.storage.getItem('stock-in-info-car').then(info => {
        if (info) {
          let formData = app.utils.copyObj(this.data.formData, info)
          formData.certificateDate = formData.certificateDate ? formData.certificateDate - 1 : ''
          this.setData({ 
            formData,
            'showEdit': this.options.edit !== '0',
            'uploadImages': info.stockCarImages ? info.stockCarImages.split(',').map(item => {
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
          this.getCheshen(info.familyId)
          this.getNeishi(info.familyId)
        }
      }).finally(_ => {
        let followInformation = this.data.formData.followInformation ? this.data.formData.followInformation.split(',') : []
        this.setData({
          'carParts.list': app.config.baseData.incarParts.map((item, index) => {
            return {
              id: index + 1,
              checked: followInformation.includes(item),
              name: item
            }
          })
        })
        this.getCangList()
      })
    }, this.route)
  },
  onUnload: function () {
    app.storage.removeItem('stock-in-info-car')
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
        case 'warehouseId':
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
  // 仓位
  getCangList: function () {
    app.post(app.config.cangList).then(({ data }) => {
      this.setData({
        'cang.index': data.findIndex(item => item.warehouseId === this.data.formData.warehouseId),
        'cang.list': data
      })
    })
  },
  changeCar: function (carType = {}, family = {}, brand = {}) {
    if (this.data.formData.carsId !== carType.id) {
      this.setData({
        'formData.carsId': carType.id,
        'formData.carsName': carType.name,
        'formData.guidePrice': carType.price,
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
  showCarParts: function () {
    app.storage.setItem('stock-add-car-parts', this.data.carParts.list)
    app.navigateTo('parts')
  },
  // 图片文字识别
  showError: function (msg = '操作错误') {
    wx.showToast({
      image: '../../images/error.png',
      title: msg
    })
  },
  image2text: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 上传图片到服务器
        wx.showLoading({ title: '图片上传中' })
        wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFiles[0].path,
          name: 'img_file',
          success: res => {
            if (res.statusCode === 200) {
              if (typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }
              // 图片文字识别
              wx.showLoading({ title: '图片识别中' })
              app.post(app.config.image2text, {
                url: res.data.data
              }).then(({data}) => {
                this.setData({
                  'formData.frameNumber': data
                })
              }).finally(_ => {
                wx.hideLoading()
              })
            } else {
              this.showError('图片上传失败')
            }
          },
          fail: res => {
            this.showError('图片上传失败')
          }
        })
      }
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
  delCar: function () { // 删除车辆
    wx.showModal({
      content: '是否确定删除该车辆',
      success: res => {
        if(res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.stockInDelCar, {
            stockCarId: this.data.formData.stockCarId
          }).then(_ => {
            wx.hideLoading()
            app.toast('删除成功').then(_ => {
              this.backPage()
            })
          }).catch(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  anginAdd: function () {
    this.setData({
      'result.visible': false
    })
  },
  backPage: function () {
    app.getPrevPage().then(prevPage => {
      if (prevPage.route == 'level2/stock/in/info') {
        prevPage.getInfo()
      } else if (prevPage.route == 'level2/stock/in/list') {
        prevPage.getList()
      }
      app.back()
    })
  },
  submit: function () { // 保存信息
    if (!this.data.formData.warehouseId) {
      this.showTopTips('请选择入库仓位')
      return
    }
    if (!this.data.formData.carsId) {
      this.showTopTips('请选择入库车型')
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
    if (!this.data.formData.frameNumber) {
      this.showTopTips('请添加车架号')
      return
    }

    let formData = Object.assign({}, this.data.formData)

    formData.certificateDate = Number(this.data.formData.certificateDate) + 1
    formData.stockCarImages = this.data.uploadImages.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.stockInAddCar, formData).then(({ data }) => {
      wx.hideLoading()
      app.toast('保存成功').then(_ => {
        if (formData.storageId) {
          app.getPrevPage().then(prevPage => {
            prevPage.getInfo ? prevPage.getInfo() : prevPage.getList()
            app.back()
          })
        }else {
          this.setData({
            'formData.frameNumber': '',
            'formData.engineNumber': '',
            'result.visible': true
          })
        }
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})