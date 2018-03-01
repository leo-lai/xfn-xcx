// express/freight/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    formData: {
      dedicatedLineId: '',
      dedicatedLineName: '',
      startingPointAddress: '',
      destinationAddress: '',
      departureTime: '',
      amount: '',
      remarks: '',
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('l-freight2-info').then(info => {
      if(info) {
        this.setData({
          'formData': app.utils.copyObj(this.data.formData, info)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
    let value = event.detail.value

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 选择发车时间
  sltSendTime: function () {
    app.navigateTo('/pages/week-selector/index')
  },
  sendTimeCb: function (days) {
    this.setData({
      'formData.departureTime': days.join(',')
    })
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.dedicatedLineName) {
      this.showTopTips('请输入专线名称')
      return
    }
    if (!this.data.formData.amount) {
      this.showTopTips('请输入专线运输费用')
      return
    }
    if (!this.data.formData.startingPointAddress) {
      this.showTopTips('请输入出发地点')
      return
    }
    if (!this.data.formData.destinationAddress) {
      this.showTopTips('请输入到达地点')
      return
    }
    if (!this.data.formData.dedicatedLineName) {
      this.showTopTips('请选择发车时间')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.exp.freight2, this.data.formData).then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getList && prevPage.getList()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})