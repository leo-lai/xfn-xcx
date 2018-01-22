// pages/car-bespeak/index2.js
const app = getApp()
const resURL = app.config.resURL
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    resURL,
    topTips: '',
    people: [
      {
        title: '选车老司机',
        name: '易文开',
        tel: '13828029223',
        desc: '从事汽车销售行业超10年，现任淘车网销售主管，精通各品牌车型优劣并有自己独特的见解，选车经验无人能敌！',
        image: resURL + '/20180115014.jpg'
      }, {
        title: '挑车细节控',
        name: '欧婷婷',
        tel: '15992100650',
        desc: '从事汽车销售行业超5年，为人完美挑剔，擅长根据客户要求挑出最适合客户的车型，比客户的要求还要高！',
        image: resURL + '/20180115015.jpg'
      }, {
        title: '汽车百事通',
        name: '罗志平',
        tel: '15819924161',
        desc: '从事汽车销售行业超5年，热爱研究新车资讯，掌握时下最流行的新车趋势，想找最IN最潮的车，就找他！',
        image: resURL + '/20180115016.jpg'
      }, {
        title: '汽车小江湖',
        name: '黄文坚',
        tel: '13422789520',
        desc: '从事汽车销售行业超5年，汽车世家出身，从小玩车，江湖百晓生，传闻没有什么汽车的问题是他不会的，大家可以问问看！',
        image: resURL + '/20180115017.jpg'
      }, {
        title: '资深车达人',
        name: '梁建斌',
        tel: '13025840255',
        desc: '从事汽车销售行业超5年，常年混迹于各大汽车论坛，对用车选车养车有丰富的知识储备以及实战经验！',
        image: resURL + '/20180115018.jpg'
      }, {
        title: '贴心车小秘',
        name: '邓小容',
        tel: '13760518910',
        desc: '从事汽车销售行业超5年，以女性独特的细心服务获得客户大力认可。买车最怕烦，有了她，您绝对可以高枕无忧好车到手！',
        image: resURL + '/20180115019.jpg'
      }
    ],
    sltedCar: {
      brandId: '',
      brandName: '',
      familyId: '',
      familyName: '',
      carId: '',
      carName: ''
    },
    store: {
      visible: false,
      height: 602 - 200,
      slted: {},
      list: []
    },
    buyTime: {
      index: -1,
      list: ['3天内', '7天内']
    },
    asked: {
      endDate: null,
      number: 0,
      list: []
    },
    timedown: {
      d: '0',
      h: '00',
      m: '00',
      s: '00'
    },
    qrcode: {
      visible: false
    },
    formData: {
      orgId: '',
      carId: '',
      customerUsersName: '',
      phoneNumber: '',
      carPurchaseIntention: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#fd5e02',
    })
    
    wx.getSystemInfo({
      success: res => {
        this.setData({
          'store.height': res.windowHeight - 200
        })
      }
    })

    app.onLogin(userInfo => {
      this.getStoreList()
      this.getAskedList()
    }, this.route)
  },
  onUnload: function () {
    clearInterval(this.timerId)
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
      this.setData({ topTips: '' })
    }, 3000)
  },
  // 表单输入
  bindInput: function (event) {
    let data = {}
    let value = event.detail.value
    let id = event.target.id
    if (id === 'carPurchaseIntention') {
      data['buyTime.index'] = value
      value = Number(value) + 1
    }

    data['formData.' + id] = value
    this.setData(data)
  },
  getStoreList: function () { // 门店列表
    wx.showLoading()
    app.post(app.config.storeList).then(({ data }) => {
      this.setData({
        'store.slted': data[0],
        'store.list': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  showStore: function () {
    this.setData({ 'store.visible': true })
  },
  closeStore: function () {
    this.setData({ 'store.visible': false })
  },
  sltStore: function (event) {
    let slted = event.currentTarget.dataset.item
    let list = this.data.store.list.map(item => {
      if (item.orgId === slted.orgId) {
        item.checked = true
      } else {
        item.checked = false
      }
      return item
    })
    this.setData({
      'store.slted': slted,
      'store.list': list
    })
    this.closeStore()
  },
  showCarList: function (event) {
    let val = event.currentTarget.dataset.val
    let { brandId, familyId, carId } = this.data.sltedCar
    let ids = []
    val >= 1 && ids.push(brandId)
    val >= 2 && ids.push(familyId)
    val >= 3 && ids.push(carId)
    app.navigateTo('../car-selector/index?ids=' + ids.join(','))
  },
  changeCar: function (carType = {}, family = {}, brand = {}) {
    this.setData({
      'sltedCar.brandId': brand.id || '',
      'sltedCar.brandName': brand.name || '',
      'sltedCar.familyId': family.id || '',
      'sltedCar.familyName': family.name || '',
      'sltedCar.carId': carType.id || '',
      'sltedCar.carName': carType.name || ''
    })
  },
  callPhone: function (event) {
    let val = event.currentTarget.dataset.val
    wx.makePhoneCall({
      phoneNumber: val,
    })
  },
  copyWeiXin: function (event) {
    let val = event.currentTarget.dataset.val
    wx.setClipboardData({
      data: val,
      success: res => {
        wx.showToast({
          title: '已复制微信号',
        })
      }
    })
  },
  getAskedList: function () { // 最新报名名单
    app.post(app.config.askedList).then(({data}) => {
      this.setData({ 'asked': data  })
      clearInterval(this.timerId)
      this.timerId = setInterval(_ => {
        this.setTimeDown(this.data.asked.endDate)
      }, 1000)
    })
  },
  setTimeDown: function (endDate) {
    let timerArr = app.utils.timer(endDate)
    this.setData({
      'timedown.d': timerArr[0],
      'timedown.h': timerArr[1],
      'timedown.m': timerArr[2],
      'timedown.s': timerArr[3]
    })
  },
  askPrice: function () {
    if (!this.data.store.slted.orgId) {
      this.showTopTips('请选择门店')
      return
    }

    if (!this.data.sltedCar.carId) {
      this.showTopTips('请选择车辆')
      return
    }

    if (!this.data.formData.customerUsersName) {
      this.showTopTips('请输入姓名')
      return
    }

    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }

    if (this.data.formData.carPurchaseIntention === '') {
      this.showTopTips('请选择购车时间')
      return
    }

    this.data.formData.orgId = this.data.store.slted.orgId
    this.data.formData.carId = this.data.sltedCar.carId
    wx.showLoading({ mask: true })
    app.post(app.config.bespeak2, this.data.formData).then(({ data }) => {
      app.toast('报名成功')
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  backTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  showQrcode: function () {
    // this.setData({ 'qrcode.visible': true })
    wx.previewImage({
      urls: [resURL + '/taochekuai.jpg'],
    })
  },
  closeQrcode: function () {
    this.setData({ 'qrcode.visible': false })
  }
})