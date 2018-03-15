// level3/customer/info.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    isNull: true,
    topTips: '',
    buyTime: app.config.baseData.buyTime,
    buyWay: app.config.baseData.buyWay,
    orderState: {
      '1': '待交定金',
      '3': '等待银行审核',
      '4': '银行审核不通过',
      '5': '等待车辆出库',
      '7': '等待加装精品',
      '9': '等待上牌',
      '11': '等待贴膜',
      '13': '等待交付车辆',
      '15': '客户已提车',
      '17': '已交车完毕'
    },
    appointInfo: {
      visible: false,
      data: null
    },
    bankPass: {
      visible: false
    },
    orderInfo: {},
    customerInfo: {},
    remarkInfo: {
      showAll: false,
      visible: false,
      loading: false,
      _list: [],
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
      this.$params = {
        ids: options.ids ? options.ids.split(',') : ['', '']
      }
      wx.showNavigationBarLoading()
      this.getInfo().finally(_ => {
        wx.hideNavigationBarLoading()
      })
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
    return app.post(app.config.customerInfo, {
      customerUsersId: this.$params.ids[0],
      customerUsersOrgId: this.$params.ids[1]
    }).then(({ data }) => {
      if (data) {
        data.customerMap.thumb = data.customerMap.headPortrait ?
          app.utils.formatHead(data.customerMap.headPortrait) : app.config.avatar
        this.setData({
          'isNull': false,
          'bankResult': {
            loanRefuseRemarks: data.loanRefuseRemarks,
            overLoanRefuse: data.overLoanRefuse
          },
          'appointInfo.data': data.appointmentMap,
          'orderInfo': data.orderMap,
          'customerInfo': data.customerMap,
          'remarkInfo._list': data.remarksMap.list,
          'remarkInfo.list': data.remarksMap.list.length > 0 ? [data.remarksMap.list[0]] : []
        })
      } else {
        this.setData({
          'isNull': true
        })
      }
    })
  },
  // 查看上传资料
  viewBankInfo: function () {
    let { bankAuditsImage, bankAuditsvideo } = this.data.info
    app.storage.setItem('bankInfo', {
      bankAuditsImage, bankAuditsvideo
    })
    app.navigateTo('/pages/bank-uploader/view')
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
    data['remarkInfo.data.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  showRemarkPop: function () {
    this.setData({
      'remarkInfo.visible': true,
      'remarkInfo.data.customerUsersId': this.$params.ids[0],
      'remarkInfo.data.remarksContent': ''
    })
  },
  closeRemarkPop: function () {
    this.setData({ 'remarkInfo.visible': false })
  },
  // 添加备注
  addRemark: function () {
    if (!this.data.remarkInfo.data.remarksContent) {
      this.showTopTips('请输入备注内容')
      return
    }

    this.setData({ 'remarkInfo.loading': true })
    app.post(app.config.customerRemark, this.data.remarkInfo.data).then(({ data }) => {
      app.toast('操作成功')
      this.setData({
        'remarkInfo.visible': false,
        'remarkInfo.loading': false,
        'remarkInfo._list': [data, ...this.data.remarkInfo._list],
        'remarkInfo.list': this.data.remarkInfo.showAll ? [data, ...this.data.remarkInfo._list] : [data]
      })
    }).catch(_ => {
      this.setData({ 'remarkInfo.loading': false })
    })
  },
  showAllRemark: function () {
    let isAll = !this.data.remarkInfo.showAll
    this.setData({
      'remarkInfo.showAll': isAll,
      'remarkInfo.list': isAll ? this.data.remarkInfo._list : [this.data.remarkInfo._list[0]]
    })
  },
  // 显示预约信息
  showAppoint: function () {
    this.setData({ 'appointInfo.visible': !this.data.appointInfo.visible })
  },
  // 显示客户资料
  showCustomerDetails: function () {
    app.storage.setItem('customer_details', this.data.customerInfo)
    app.navigateTo('details')
  },
  // 显示购车单信息
  showCustomerOrder: function () {
    let url = 'order?ids=' + this.data.customerInfo.customerUsersId
    if (this.data.orderInfo.customerOrderId) {
      url += ',' + this.data.orderInfo.customerOrderId
    }
    this.closeBankPass()
    app.navigateTo(url)
  },
  // 银行审核
  bankPass: function (event) {
    let isPass = event.currentTarget.dataset.val
    let promise
    wx.showLoading({ mask: true })
    if (isPass == 1) { // 通过审核
      promise = app.post(app.config.bankPass, { customerOrderId: this.data.orderInfo.customerOrderId })
    } else if (isPass == 2) { // 不通过审核，全款支付
      promise = app.post(app.config.bankNotPass, { customerOrderId: this.data.orderInfo.customerOrderId })
    }

    promise && promise.then(_ => {
      app.toast('操作成功').then(_ => {
        this.closeBankPass()
        this.getInfo()
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  bankUpload: function () {
    app.storage.setItem('bankInfo', {
      bankAuditsImage: this.data.orderInfo.bankAuditsImage,
      bankAuditsvideo: this.data.orderInfo.bankAuditsvideo
    })
    app.navigateTo('/pages/bank-uploader/index?id=' + this.data.customerInfo.customerUsersId)
  },
  showBankPass: function () {
    this.setData({
      'bankPass.visible': true
    })
  },
  closeBankPass: function () {
    this.setData({
      'bankPass.visible': false
    })
  }
})