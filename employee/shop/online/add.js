// shop/online/add.js
const app = getApp()
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
    cang: { // 入库仓位
      index: -1,
      list: []
    },
    uploadImages1: [], // 轮播图片
    uploadImages2: [], // 详情图片
    formData: {
      goodsCarsId: '',
      carsId: '',
      carsName: '',
      guidingPrice: '',
      familyId: '',
      colourId: '',
      colourName: '',
      interiorId: '',
      interiorName: '',
      saleingNumber: '',
      onlineDis: 1,          // 线上优惠or加价
      discountPriceOnLine: '',
      bareCarPriceOnLine: '',
      underLineDis: 1,       // 线下优惠or加价
      discountPriceUnderLine: '',
      bareCarPriceUnderLine: '',
      overInsurance: 1,
      depositPrice: '',
      invoicePrice: '',
      provinceId: '',
      provinceName: '',
      cityId: '',
      cityName: '',
      areaId: '',
      areaName: '',
      warehouseId: '',
      logisticsCycle: '',
      logisticsPrice: '',
      invoiceCycle: '',
      dateOfManufacture: '',
      remarks: '',
      carsImage: '',
      carsImages: '',
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      app.storage.getItem('shop-goods-info').then(info => {
        if(info) {
          info.onlineDis = info.discountPriceOnLine > 0 ? 0 : 1
          info.underLineDis = info.discountPriceUnderLine > 0 ? 0 : 1
          info.discountPriceOnLine = Math.abs(info.discountPriceOnLine)
          info.discountPriceUnderLine = Math.abs(info.discountPriceUnderLine)

          let formData = app.utils.copyObj(this.data.formData, info)
          let uploadImages1 = formData.carsImages ? formData.carsImages.split(',').map(item => {
            return {
              path: item,
              src: item,
              done: true,
              loading: false,
              progress: 100,
              tick: app.utils.guid()
            }
          }) : []
          let uploadImages2 = formData.carsImage ? formData.carsImage.split(',').map(item => {
            return {
              path: item,
              src: item,
              done: true,
              loading: false,
              progress: 100,
              tick: app.utils.guid()
            }
          }) : []
          this.setData({ formData, uploadImages1, uploadImages2 })
          
          this.getCheshen(formData.familyId)
          this.getNeishi(formData.familyId)
        }
      }).finally(_ => {
        this.getCangList()
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  onUnload: function () {
    app.storage.removeItem('shop-goods-info')
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({ topTips })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({ topTips: '' })
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
          data['formData.colourName'] = this.data[picker].list[value].carColourName
          value = this.data[picker].list[value].carColourId
          break
        case 'interiorId':
          data['formData.interiorName'] = this.data[picker].list[value].interiorName
          value = this.data[picker].list[value][id]
          break
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

    let dis = 0, discountPrice = 0, bareCarPrice = 0
    switch (id) {
      case 'onlineDis':
      case 'discountPriceOnLine':
        if (id == 'onlineDis') {
          dis = Number(value)
          discountPrice = Number(this.data.formData.discountPriceOnLine)
        }else {
          dis = Number(this.data.formData.onlineDis)
          discountPrice = Number(value) || 0
        }

        if (this.data.formData.guidingPrice) {
          bareCarPrice = this.data.formData.guidingPrice
          if (dis == 1) {
            bareCarPrice -= discountPrice
          }else{
            bareCarPrice += discountPrice
          }
          this.setData({
            'formData.bareCarPriceOnLine': bareCarPrice
          })
        }
        break
      case 'underLineDis':
      case 'discountPriceUnderLine':
        if (id == 'underLineDis') {
          dis = Number(value)
          discountPrice = Number(this.data.formData.discountPriceUnderLine)
        }else{
          dis = Number(this.data.formData.underLineDis)
          discountPrice = Number(value) || 0
        }
        
        if (this.data.formData.guidingPrice) {
          bareCarPrice = this.data.formData.guidingPrice
          if (dis == 1) {
            bareCarPrice -= discountPrice
          } else {
            bareCarPrice += discountPrice
          }
          this.setData({
            'formData.bareCarPriceUnderLine': bareCarPrice
          })
        }
        break
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
        'formData.familyId': family.id,
        'formData.colourId': '',
        'formData.colourName': '',
        'formData.interiorId': '',
        'formData.interiorName': ''
      })
      this.getCheshen(family.id)
      this.getNeishi(family.id)
    }
  },
  getCheshen: function (familyId = '') { // 获取车身颜色列表
    if (!familyId) return
    app.post(app.config.cheshen, { familyId }).then(({ data }) => {
      this.setData({
        'cheshen.index': data.findIndex(item => item.carColourId == this.data.formData.colourId),
        'cheshen.list': data
      })
    })
  },
  getNeishi: function (familyId = '') { // 获取内饰颜色列表
    if (!familyId) return
    app.post(app.config.neishi, { familyId }).then(({ data }) => {
      this.setData({
        'neishi.index': data.findIndex(item => item.interiorId == this.data.formData.interiorId),
        'neishi.list': data
      })
    })
  },
  // 选择区域
  onRegion: function (area, city, province) {
    if (area && city && province) {
      this.setData({
        'formData.provinceId': province.value,
        'formData.provinceName': province.text,
        'formData.cityId': city.value,
        'formData.cityName': city.text,
        'formData.areaId': area.value,
        'formData.areaName': area.text
      })
    }
  },
  // 仓位
  getCangList: function () {
    app.post(app.config.shop.cangList).then(({ data }) => {
      this.setData({
        'cang.index': data.findIndex(item => item.warehouseId === this.data.formData.warehouseId),
        'cang.list': data
      })
    })
  },
  // 选择图片
  chooseImage: function (event) {
    let imgsName = event.currentTarget.dataset.name
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let images = this.data[imgsName]
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
              this.syncView(imgsName, item)
            },
            fail: res => {
              item.done = false
              item.loading = false
              this.syncView(imgsName, item)
            }
          })
          // 上传进度
          item.uploadTask.onProgressUpdate(res => {
            if (res.progress < 100) {
              item.progress = res.progress
              this.syncView(imgsName, item)
            }
          })
          return item
        })

        let tempData = {}
        tempData[imgsName] = images.concat(resImage)
        this.setData(tempData)
      }
    })
  },
  previewImage: function (event) {
    let current = event.currentTarget.id
    let urls = event.currentTarget.dataset.imgs.map(item => item.path)
    wx.previewImage({ current, urls })
  },
  longDelImage: function (event) {
    let imgsName = event.currentTarget.dataset.name
    let uploadImages = this.data[imgsName]
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#fa5539',
      success: res => {
        if (res.tapIndex === 0) {
          let leftImages = uploadImages.filter(item => {
            if (item.tick === event.currentTarget.dataset.val) {
              item.uploadTask && item.uploadTask.abort()
              return false
            }
            return true
          })
          let tempData = {}
          tempData[imgsName] = leftImages
          this.setData(tempData)
        }
      }
    })
  },
  // 同步视图
  syncView: function (imgsName = 'uploadImages', objectItem = {}, key = 'tick') {
    if (!objectItem[key]) return
    let uploadImages = this.data[imgsName] 

    for (let i = uploadImages.length - 1; i >= 0; i--) {
      if (uploadImages[i][key] === objectItem[key]) {
        uploadImages[i] = objectItem
        let tempData = {}
        tempData[imgsName] = uploadImages
        this.setData(tempData)
        break
      }
    }
  },
  // 保存信息
  submit: function () {
    let formData = Object.assign({}, this.data.formData)
    if (!formData.carsId) {
      this.showTopTips('请选择车型')
      return
    }

    formData.discountPriceOnLine = formData.onlineDis == 1 ? 0 - formData.discountPriceOnLine : formData.discountPriceOnLine
    formData.discountPriceUnderLine = formData.underLineDis == 1 ? 0 - formData.discountPriceUnderLine : formData.discountPriceUnderLine

    formData.carsImages = this.data.uploadImages1.map(item => item.src).join(',')
    formData.carsImage = this.data.uploadImages2.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.shop.goodsEdit, formData).then(({ data }) => {

      app.storage.setItem('shop-goods-list-refresh', 1)
      app.toast('保存成功').then(_ => {
        if (!formData.goodsCarsId) { // 新增
          app.getPrevPage().then(prevPage => {
            prevPage.tabClick && prevPage.tabClick(1)
            app.back()
          })
        }else{
          app.back()
        }
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})