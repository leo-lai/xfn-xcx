// express/wuliu/sign-car.js
const app = getApp()
let content = null
let touchs = []
let canvasw = 0
let canvash = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    showTip: true,
    winWidth: 375,
    signName: '',
    signPic: ''
  },
  onReachBottom: function () { },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    //获得Canvas的上下文
    content = wx.createCanvasContext('sign-canvas')
    //设置线的颜色
    content.setStrokeStyle('#000000')
    //设置线的宽度
    content.setLineWidth(5)
    //设置线两端端点样式更加圆润
    content.setLineCap('round')
    //设置两条线连接处更加圆润
    content.setLineJoin('round')

    wx.createSelectorQuery().select('#sign-box').boundingClientRect(rect => {
      canvasw = canvash = rect.width
      this.setData({ winWidth: canvasw })
      this.initCanvas()
    }).exec()
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({ topTips })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({ topTips: '' })
    }, 3000)
  },
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let value = event.detail.value

    console.log(id, value)
    data[id] = value
    this.setData(data)
  },

  initCanvas: function () {
    content.setFillStyle('#ffffff')
    content.fillRect(0, 0, canvasw, canvash)
    content.draw(true)
  },
  // 画布的触摸移动开始手势响应
  start: function (event) {
    //获取触摸开始的 x,y
    this.setData({ showTip: false })
    let point = { x: event.changedTouches[0].x, y: event.changedTouches[0].y }
    touchs.push(point)
  },

  // 画布的触摸移动手势响应
  move: function (e) {
    let point = { x: e.touches[0].x, y: e.touches[0].y }
    touchs.push(point)
    if (touchs.length >= 2) {
      this.draw(touchs)
    }
  },

  // 画布的触摸移动结束手势响应
  end: function (e) {
    //清空轨迹数组
    touchs = []
    
    // for (let i = 0; i < touchs.length; i++) {
    //   touchs.pop()
    // }
  },

  // 画布的触摸取消响应
  cancel: function (e) {
    console.log('触摸取消' + e)
  },

  // 画布的长按手势响应
  tap: function (e) {
    console.log('长按手势' + e)
  },

  error: function (e) {
    console.log('画布触摸错误' + e)
  },
  //绘制
  draw: function (touchs) {
    let point1 = touchs[0]
    let point2 = touchs[1]
    touchs.shift()
    content.moveTo(point1.x, point1.y)
    content.lineTo(point2.x, point2.y)
    content.stroke()
    content.draw(true)
  },
  //清除操作
  clear: function () {
    //清除画布
    content.clearRect(0, 0, canvasw, canvash)
    this.initCanvas()
    content.draw(true)
  },
  // 确定签收
  submit: function () {
    let cars = this.options.cars ? this.options.cars.split(',') : []

    if(cars.length === 0) {
      wx.showModal({
        content: '不存在签收车辆',
        showCancel: false
      })
      return
    }

    wx.canvasToTempFilePath({
      canvasId: 'sign-canvas',
      success: res => {
        console.log(res.tempFilePath)
        // 上传签名图片
        wx.showLoading({ title: '正在上传图片' })
        wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFilePath,
          name: 'img_file',
          success: res => {
            if (res.statusCode === 200) {
              if (typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }

              let formData = {
                consignmentId: this.options.id,
                cars: []
              }
              
              formData.cars = cars.map(item => {
                return {
                  goodsCarId: item,
                  signName: this.data.signName,
                  signPic: res.data.data
                }
              })

              wx.showLoading({ title: '保存中' })
              app.json(app.config.wuliuSign, formData).then(_ => {
                app.toast('保存成功', true).then(_ => {
                  app.getPrevPage().then(prevPage => {
                    if (prevPage.getInfo) {
                      prevPage.getInfo()
                    } else {
                      prevPage.getList && prevPage.getList()
                    }
                  })
                })
              }).catch(_ => {
                wx.hideLoading()
              })

            } else {
              wx.showToast({
                image: '../../images/error.png',
                title: '上传失败(' + res.statusCode + ')'
              })
            }
          },
          fail: res => {
            wx.showToast({
              image: '../../images/error.png',
              title: '图片上传失败'
            })
          }
        })
      }
    })
  }
})