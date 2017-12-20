// pages/customer-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    userInfo: null,
    isOrder: '',
    buyTime: app.config.baseData.buyTime,
    buyWay: app.config.baseData.buyWay,
    info: null,
    state: {},
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
      this.params = {
        ids: options.ids ? options.ids.split(',') : ['','']
      }
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('car_uploader_refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('car_uploader_refresh')
          this.getInfo()
        }
      })
    }).finally(_ => {
      app.storage.setItem('current_page', this.route)
    })
  },
  // 客户详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.customerInfo, {
      customerUsersId: this.params.ids[0],
      customerUsersOrgId: this.params.ids[1]
    }).then(({ data }) => {
      let info = data.customerMap
      info.customerUsersId = this.params.ids[0]
      info.thumb = info.headPortrait ? app.utils.formatHead(info.headPortrait) : app.config.avatar
      this.setData({ 
        'info': info,
        'state': {
          trackContent: data.trackContent,
          createDate: data.createDate
        },
        'isOrder': data.isOrder,
        'remark.list': data.remarksMap.list
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 查看上传资料
  viewBankInfo: function() {
    let { bankAuditsImage, bankAuditsvideo } = this.data.info
    app.storage.setItem('bankInfo', {
      bankAuditsImage, bankAuditsvideo
    })
    app.navigateTo('../car-uploader/view')
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
  showRemarkPop: function () {
    this.setData({
      'remark.visible': true,
      'remark.data.customerUsersId': this.params.ids[0],
      'remark.data.remarksContent': ''
    })
  },
  closeRemarkPop: function () {
    this.setData({
      'remark.visible': false
    })
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
        'remark.visible': false,
        'remark.loading': false
      })
      // if(data) {
      //   this.setData({
      //     'remark.list': this.data.remark.list.push(data)
      //   })
      // }else {
        this.getInfo()
      // }
    }).catch(_ => {
      this.setData({ 'remark.loading': false })
    })
  }
})