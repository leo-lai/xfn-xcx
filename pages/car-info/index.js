// pages/car-info/index.js
var tabWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var WxParse = require('../../components/wxParse/wxParse.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePlayer: {
      data: []
    },
    sltedCar: {},
    sltedColor: {},
    info: {},
    tabs: {
      isTop: false,
      visible: false,
      data: ['基本信息', '参数配置', '常见问题'],
      offset: 0,
      left: 0,
      index: 0,
      height: 602 - 50
    },
    // 车辆介绍
    introduce: {
      loading: false,
      data: null
    },
    // 车辆参数
    parameter: {
      loading: false,
      data: null
    },
    // 车辆问题
    problem: {
      loading: false,
      data: null
    },
    // 计算器
    counter: {
      height: 602,
      visible: false,
      tabIndex: 0,
      fullPayment: null,
      loanPayment: null,
      percent: 0.3,
      year: 3
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
          'tabs.height': res.windowHeight - 50,
          'counter.height': res.windowHeight - 240,
          'tabs.left': (res.windowWidth / that.data.tabs.data.length - tabWidth) / 2,
          'tabs.offset': res.windowWidth / that.data.tabs.data.length * that.data.tabs.index
        })
      }
    })

    app.storage.removeItem('carInfo-tempCar')
    app.onLogin(userInfo => {
      this.getInfo(options.id)
    })
  },
  onShow: function () {
    app.storage.getItem('carInfo-tempCar').then(sltedCar => {
      if (sltedCar && this.data.sltedCar.carsId !== sltedCar.carsId) {
        this.data.sltedCar = sltedCar
        this.getInfo(sltedCar.carsId)
        WxParse.wxParse('introduce.data', 'html', '', this)
        this.setData({
          'tabs.visible': false,
          'introduce.data': null,
          'parameter.data': null
        })
      }
    })
  },
  onPullDownRefresh: function () {
    if (this.data.info || this.data.info.carsId) {
      this.getInfo(this.data.info.carsId).finally(_ => {
        wx.stopPullDownRefresh()
      })
    }
  },
  onReachBottom: function (event) {
    if (!this.data.tabs.visible) {
      this.setData({
        'tabs.visible': true
      })
      this.tabClick()
    }
  },
  onPageScroll: function(event) {
    if(!this.infoTabs) {
      var query = wx.createSelectorQuery()
      query.select('#info-tabs').boundingClientRect()
      this.infoTabs = query
    }

    clearTimeout(this.scrollTimeid)
    this.scrollTimeid = setTimeout(_ => {
      this.infoTabs.exec(res => {
        let top = res[0].top
        if (top <= 0 && this.data.tabs.visible){
          this.setData({
            'tabs.isTop': true
          })
        } else if (top >= this.data.tabs.height) {
          this.setData({
            'tabs.isTop': false
          })
        }
      })
    }, 50)
  },
  // 车辆详情
  getInfo: function (carId = '') {
    wx.showLoading()
    return app.post(app.config.carInfo, { carId }).then(({ data }) => {
      data.priceStr = (data.price / 10000).toFixed(2)
      data.minPriceStr = (data.minPrice / 10000).toFixed(2)
      data.list = data.list.map(item => {
        item.images = item.imagePath ? item.imagePath.split(',')
          .filter(image => image)
          .map((image, index) => {
            return  {
              hidden: index > 0 ? true : false,
              src: image
            }
          }) : []
        return item
      })
      this.setData({
        'info': data,
        'imagePlayer.data': data.list[0] ? data.list[0].images : [data.indexImage],
        'sltedColor': data.list[0],
        'tabs.visible': false
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 选择颜色
  sltColor: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      'imagePlayer.data': item.images || [this.data.info.indexImage],
      'sltedColor': item
    })
  },
  // 更换车型
  sltCar: function (event) {
    app.navigateTo(`../car-slt/index?id=${this.data.info.familyId}`)
  },
  tabClick: function (event) {
    let index
    if(event) {
      index = event.currentTarget.dataset.val
      this.setData({
        'tabs.offset': event.currentTarget.offsetLeft,
        'tabs.index': index
      })
    }else {
      index = this.data.tabs.index
    }
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
  getIntroduce: function () {
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
  getParameter: function () {
    this.setData({
      'parameter.loading': true
    })
    app.post(app.config.carParameter, { carId: this.data.info.carsId })
      .then(({ data }) => {
        let retList = []
        let tempObj = {}
        data.forEach((item, index) => {
          if (!tempObj[item.typeName]) {
            tempObj[item.typeName] = {
              id: 'param-' + item.typeCode,
              open: index > 0 ? false : true,
              code: item.typeCode,
              name: item.typeName,
              list: [item]
            }
            retList.push(tempObj[item.typeName])
          } else {
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
  getProblemList: function () {
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
        list[i].open = false
      }
    }
    this.setData({
      'parameter.data': list
    })
  },
  showCounter() {
    this.setData({
      'counter.visible': true
    })
    if (this.data.counter.tabIndex === 0) {
      this.getFullPayment()
    } else if (this.data.counter.tabIndex === 1) {
      this.getLoanPayment()
    }
  },
  closeCounter() {
    this.setData({
      'counter.visible': false
    })
  },
  counterTab(event) {
    let index = event.currentTarget.dataset.val
    this.setData({
      'counter.tabIndex': index
    })

    if (index === 0) {
      this.getFullPayment()
    } else if (index === 1) {
      this.getLoanPayment()
    }
  },
  percentChange(event) {
    this.setData({
      'counter.percent': event.detail.value
    })
    this.getLoanPayment()
  },
  yearChange(event) {
    this.setData({
      'counter.year': event.detail.value
    })
    this.getLoanPayment()
  },
  // 全款
  getFullPayment: function () {
    app.post(app.config.fullPayment, {
      carId: this.data.info.carsId
    }).then(({ data }) => {
      this.setData({
        'counter.fullPayment': data
      })
    })
  },
  // 贷款
  getLoanPayment: function () {
    app.post(app.config.loanPayment, {
      carId: this.data.info.carsId,
      paymentRatio: this.data.counter.percent,
      timeOfPayment: this.data.counter.year
    }).then(({ data }) => {
      this.setData({
        'counter.loanPayment': data
      })
    })
  },
  // 预约
  askPrice: function () {
    if (!this.data.info.carsId) return
    if (!this.data.sltedColor.carColourId) {
      wx.showModal({
        title: '请选择车辆颜色',
        showCancel: false
      })
      return
    }
    app.navigateTo(`../car-bespeak/index?car=${this.data.info.carsId}&color=${this.data.sltedColor.carColourId}`)
  },
  // 360旋转
  imagesTouchStart: function (event) {
    this.data.imagePlayer.startX = event.changedTouches[0].clientX
  },
  imagesTouchMove: function (event) {
    let endX = event.changedTouches[0].clientX
    let diffX = endX - this.data.imagePlayer.startX
    let images = this.data.imagePlayer.data

    if (images.length > 1 && Math.abs(diffX) > 10) {
      this.data.imagePlayer.startX = endX
      images = images.map((image, index) => {
        if(!image.hidden) {
          image.hidden = true
          this.data.imagePlayer.index = index
        }
        return image
      })

      let activeIndex = this.data.imagePlayer.index
      if (diffX < -10) {
        ++activeIndex
      } else if (diffX > 10) {
        activeIndex = --activeIndex >= 0 ? activeIndex : images.length + activeIndex 
      }

      images[activeIndex % images.length].hidden = false
      this.setData({
        'imagePlayer.data': images
      })
    }
  }
})