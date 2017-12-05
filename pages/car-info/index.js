// pages/car-info/index.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var WxParse = require('../../components/wxParse/wxParse.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sltedCar: {},
    sltedColor: {},
    info: {},
    winHeight: 602,
    tabs: ['基本信息', '参数配置', '常见问题'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    isViewDetail: false,
    introduce: {
      loading: false,
      data: null
    },
    parameter: {
      loading: false,
      data: null
    },
    problem: {
      loading: false,
      data: null
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        })
      }
    })

    app.onLogin(userInfo => {
      this.getInfo(options.id)
    })
  },
  onShow: function() {
    app.storage.getItem('carInfo-tempCar').then(sltedCar => {
      if (sltedCar && this.data.sltedCar.carsId !== sltedCar.carsId) {
        this.data.sltedCar = sltedCar
        this.getInfo(sltedCar.carsId)
      }
    })
  },
  onUnload: function() {
    app.storage.removeItem('carInfo-tempCar')
  },
  onPullDownRefresh: function() {
    if (this.data.info || this.data.info.carsId) {
      this.getInfo(this.data.info.carsId).finally(_ => {
        wx.stopPullDownRefresh()
      })
    }
  },
  onReachBottom: function(event) {
    if (!this.data.isViewDetail) {
      this.setData({
        'isViewDetail': true
      })
      this.getIntroduce()
    }
  },
  // 车辆详情
  getInfo: function(carId = '') {
    wx.showLoading()
    return app.post(app.config.carInfo, { carId }).then(({data}) => {
      data.priceStr = (data.price / 10000).toFixed(2)
      data.minPriceStr = (data.minPrice / 10000).toFixed(2)
      this.setData({
        'info': data,
        'sltedColor': {}
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 选择颜色
  sltColor: function(event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      'sltedColor': item
    })
  },
  // 更换车型
  sltCar: function(event) {
    app.navigateTo(`../car-slt/index?id=${this.data.info.familyId}`)
  },
  tabClick: function (event) {
    let index = event.currentTarget.dataset.val
    this.setData({
      sliderOffset: event.currentTarget.offsetLeft,
      activeIndex: index
    })
    if (index === 0) {
      if (!this.data.introduce.data) {
        this.getIntroduce() 
      }
    } else if (index === 1) {
      if (!this.data.parameter.data) {
        this.getParameter()
      }
    } else if (index === 2) {
      if (!this.data.problem.data) {
        this.getProblemList()
      }
    } 
  },
  // 车辆介绍
  getIntroduce: function() {
    this.setData({
      'introduce.loading': true
    })
    app.post(app.config.carIntroduce, { carId: this.data.info.carsId })
      .then(({ data }) => {
        WxParse.wxParse('introduce.data', 'html', data.introduce || '', this, 5)
      }).finally(_ => {
        this.setData({
          'introduce.loading': false
        })
      })
  },
  // 车辆配置
  getParameter: function() {
    this.setData({
      'parameter.loading': true
    })
    app.post(app.config.carParameter, { carId: this.data.info.carsId })
      .then(({ data }) => {
        let retList = []
        let tempObj = {}
        data.forEach(item => {
          if (!tempObj[item.typeName]){
            tempObj[item.typeName] = {
              id: 'param-' + item.typeCode,
              open: false,
              code: item.typeCode,
              name: item.typeName,
              list: [item]
            }
            retList.push(tempObj[item.typeName])
          }else {
            tempObj[item.typeName].list.push(item)
          }
        })
        this.setData({
          'parameter.data': retList
        })
      }).finally(_ => {
        this.setData({
          'parameter.loading': false
        })
      })
  },
  // 车辆问题
  getProblemList: function() {
    this.setData({
      'problem.loading': true
    })
    app.post(app.config.problemList).then(({ data }) => {
        this.setData({
          'problem.data': data
        })
      }).finally(_ => {
        this.setData({
          'problem.loading': false
        })
      })
  },
  paramToggle: function (event) {
    var id = event.currentTarget.id, list = this.data.parameter.data
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        // list[i].open = false
      }
    }
    this.setData({
      'parameter.data': list
    })
  }
})