// shop/online/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    uploadImages1: [], // 活动轮播
    uploadImages2: [], // 活动详情图片
    formData: {
      goodsCarsActivityId: '',
      goodsCarsId: '',
      saleingNumber: '',
      activityPrice: '',
      depositPrice: '',
      remarks: '',
      carsImage: '',
      carsImages: '',
    },
    goodsInfo: {
      
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      app.storage.getItem('shop-active-info').then(info => {
        if(info) {
          info.onlineDis = info.discountPriceOnLine > 0 ? 0 : 1
          info.underLineDis = info.discountPriceUnderLine > 0 ? 0 : 1
          info.discountPriceOnLine = Math.abs(info.discountPriceOnLine)
          info.discountPriceUnderLine = Math.abs(info.discountPriceUnderLine)

          info.dateOfManufacture = info.dateOfManufacture ? info.dateOfManufacture.split(' ')[0] : ''
          info.saleingPriceStr = info.bareCarPriceOnLine ? (info.bareCarPriceOnLine / 10000).toFixed(2) : '0.00'
          info.guidingPriceStr = info.guidingPrice ? (info.guidingPrice / 10000).toFixed(2) : '0.00'

          let formData = app.utils.copyObj(this.data.formData, info)
          let goodsInfo = Object.assign({}, info)
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

          if (uploadImages1[0]) {
            goodsInfo.image = goodsInfo.image || uploadImages1[0].src
          }
          
          goodsInfo.thumb = app.utils.formatThumb(goodsInfo.image , 150, 150)
          this.setData({ formData, goodsInfo, uploadImages1, uploadImages2 })
        }
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
    app.storage.removeItem('shop-active-info')
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
    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 选择活动车辆
  onGoodsSlted: function (goodsInfo) {
    if(goodsInfo) {
      goodsInfo.dateOfManufacture = goodsInfo.dateOfManufacture ? goodsInfo.dateOfManufacture.split(' ')[0] : ''
      goodsInfo.discountPriceOnLineStr = Math.abs(goodsInfo.discountPriceOnLine)
      this.setData({
        goodsInfo,
        'formData.goodsCarsId': goodsInfo.goodsCarsId
      })
    }
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
    let url = event.currentTarget.dataset.imgs.map(item => item.path)
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
    
    formData.carsImages = this.data.uploadImages1.map(item => item.src).join(',')
    formData.carsImage = this.data.uploadImages2.map(item => item.src).join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.shop.activeEdit, formData).then(({ data }) => {
      app.storage.setItem('shop-active-list-refresh', 1)
      if (!formData.goodsCarsActivityId) { // 新增
        app.getPrevPage().then(prevPage => {
          prevPage.tabClick && prevPage.tabClick(1)
          app.back()
        })
      } else {
        app.back()
      }
    }).catch(err => {
      wx.hideLoading()
    })
  }
})