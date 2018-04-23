// express/wuliu/upcar.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cars: [],
    frames: [],
    images: [],
    carParts: [],
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({
        cars: this.options.cars ? this.options.cars.split(',') : []
      })
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 详情
  getInfo: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.tuoyunInfo, {
      consignmentId: this.options.id
    }).then(({ data }) => {
      let frames = [], images = [], carParts = []
      let image = null, carPart = null
      data.goodsCarVos = data.goodsCarVos.filter(item => {
        if (this.data.cars.length === 0 || this.data.cars.includes(item.goodsCarId + '')) {
          image = item.acceptImage ? item.acceptImage.split(',').map(img => {
            return {
              path: img,
              src: img,
              done: true,
              loading: false,
              progress: 100,
              tick: app.utils.guid()
            }
          }) : []

          carPart = item.followInformation ? item.followInformation.split(',') : []

          images.push(image)
          frames.push(item.frameNumber)
          carParts.push(carPart)
          return item
        }
      })
      
      this.setData({ 
        info: data,
        frames,
        images,
        carParts
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 选择车身和内饰颜色
  carColorCb: function (info) {
    if(info) {
      let carList = this.data.info.goodsCarVos
      let carItem = carList.filter(item => item.goodsCarId == info.goodsCarId)[0]
      if (info.type == 'neishi') {
        carItem.interiorId = info.id
        carItem.interiorName = info.name
      }else {
        carItem.colourId = info.id
        carItem.colourName = info.name
      }
      
      this.setData({
        'info.goodsCarVos': carList
      })
    }
  },
  // 输入车架号
  frameInput: function (event) {
    let index = event.currentTarget.dataset.index
    let value = event.detail.value
    let frames = this.data.frames
    frames[index] = value
    this.setData({ frames })
  },
  // 上传装车照片
  chooseImage: function (event) {
    let index = event.currentTarget.dataset.index
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let images = this.data.images[index]
        let resImage = res.tempFiles.map(item => {
          item.src = ''
          item.done = false
          item.loading = true
          item.progress = 0
          item.tick = app.utils.guid()

          console.log(item)
          
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
              this.syncView(index, item)
            },
            fail: res => {
              item.done = false
              item.loading = false
              this.syncView(index, item)
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

        this.data.images[index] = images.concat(resImage)
        this.setData({
          images: this.data.images
        })
      }
    })
  },
  longDelImage: function (event) {
    let index = event.currentTarget.dataset.index
    console.log(index)
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#fa5539',
      success: res => {
        if (res.tapIndex === 0) {
          this.data.images[index] = this.data.images[index].filter(item => {
            if (item.tick === event.currentTarget.dataset.val) {
              item.uploadTask && item.uploadTask.abort()
              return false
            }
            return true
          })

          this.setData({
            images: this.data.images
          })
        }
      }
    })
  },
  // 同步视图
  syncView: function (index = 0, objectItem = {}, key = 'tick') {
    if (!objectItem[key]) return
    let images = this.data.images[index]
    for (let i = images.length - 1; i >= 0; i--) {
      if (images[i][key] === objectItem[key]) {
        images[i] = objectItem
        this.setData({
          images: this.data.images
        })
        break
      }
    }
  },
  previewImage: function (event) {
    let item = event.currentTarget.dataset.item
    let index = event.currentTarget.dataset.index
    let urls = []
    if(item) {
      urls = [item.idCardPicOn, item.idCardPicOff]
    }else {
      urls = this.data.images[index].map(item => item.path)
    }
    wx.previewImage({
      current: event.currentTarget.id,
      urls
    })
  },
  // 选择随车资料
  showCarParts: function (event) {
    let index = event.currentTarget.dataset.index
    let carParts = this.data.carParts[index]
    app.storage.setItem('load-car-parts', { index, list: carParts })
    app.navigateTo('car-parts')
  },
  onCarPartsCb: function(carParts) {
    if(carParts) {
      this.data.carParts[carParts.index] = carParts.list
      this.setData({
        carParts: this.data.carParts
      })
    }
  },

  submit: function () {
    let formData = {
      distributionId: this.options.did,
      cars: []
    }
    let frames = this.data.frames
    let images = this.data.images
    let carParts = this.data.carParts
    this.data.info.goodsCarVos.forEach((item, index) => {
      formData.cars.push({
        goodsCarId: item.goodsCarId,
        colorId: item.colourId,
        interiorId: item.interiorId || '',
        vin: frames[index] || '',
        acceptImage: images[index].map(item => item.src).join(','),
        followInformation: carParts[index].join(',')
      })
    })

    wx.showLoading({ mask: true })
    app.json(app.config.loadCar, formData).then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          if (prevPage.getInfo) {
            prevPage.getInfo()
          } else {
            prevPage.getList && prevPage.getList()
          }
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})