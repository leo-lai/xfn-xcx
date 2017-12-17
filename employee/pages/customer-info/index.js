// pages/customer-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: app.config.avatar,
    topTips: '',
    userInfo: null,
    info: null,
    remark: {
      visible: false,
      loading: false,
      list: [],
      data: {
        customerUsersId: '',
        remarksContent: ''
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
      console.log(options.id)
      this.params = {
        id: options.id
      }
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 客户详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.customerInfo, {
      customerUsersId: this.params.id
    }).then(({ data }) => {
      // data.guidingPriceStr = (data.guidingPrice / 10000).toFixed(2) + '万'

      this.setData({
        'info': data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  showRemarkPop: function () {
    this.setData({
      'remark.visible': true,
      'remark.data.customerUsersId': this.params.id,
      'remark.data.remarksContent': ''
    })
  },
  closeRemarkPop: function () {
    this.setData({
      'remark.visible': false
    })
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
    data['remark.data.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  // 添加备注
  addRemark: function () {
    if (!this.data.remark.data.remarksContent){
      this.showTopTips('请输入备注内容')
      return
    }

    this.setData({ 'remark.loading': true })
    app.post(app.config.customerRemark, this.data.remark.data).then(({data}) => {
      app.toast('操作成功')
      this.setData({
        'remark.list': data ? this.data.remark.list.push(data) : this.data.remark.list, 
        'remark.visible': false,
        'remark.loading': false
      })
    }).catch(_ => {
      this.setData({ 'remark.loading': false })
    })
  }
})