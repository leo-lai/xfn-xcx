// level3/customer/list-order.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    stateTitle: {
      '1': '待收定金订单',
      '3': '待银行审核订单',
      '5': '待车辆出库订单',
      '6': '加装精品/上牌/贴膜订单',
      '17': '已完款可放行订单'
    },
    filter: {
      loading: false,
      data: {
        keywords: '',
        state: '',
        month: ''
      }
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      rows: 50,
      data: []
    },
    visit: {
      visible: false,
      data: {}
    },
    bankPass: {
      orderId: '',
      visible: false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      let state = this.options.sta || ''
      let month = this.options.month || ''
      this.setData({
        customerUsersId: this.options.id || '',
        'filter.data.month': month,
        'filter.data.state': state
      })

      wx.setNavigationBarTitle({
        title: this.data.stateTitle[state] || (month ? '本月客户总订单' : '客户购车单列表'),
      })
      
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv3-order-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('lv3-order-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  onReachBottom: function () {
    if (app.globalData.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (app.globalData.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })

    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 订单列表
  getList: function (page = 1, callback = app.noopFn) {
    let rows = this.data.list.rows
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.ajax(app.config.customer.orderList, {
      customerId: this.data.customerUsersId,
      page, rows,
      ...this.data.filter.data
    }).then(({ data }) => {
      // 兼容非分页返回
      data = data || []
      if (!data.list && data.length >= 0) {
        //rows = 10000
        data = {
          total: data.length,
          list: data
        }
      }

      data.list = data.list.map(item => {
        item.thumb = item.headPortrait ? app.utils.formatHead(item.headPortrait) : app.config.avatar
        return item
      })

      this.setData({
        'list.more': data.list.length >= rows,
        'list.page': page,
        'list.data': page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
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
    data['visit.data.' + event.target.id] = event.detail.value
    this.setData(data)
  },
  // 回访备注
  visitShow: function (event) {
    this.setData({
      'visit.data.customerOrderId': event.currentTarget.id,
      'visit.visible': true
    })
  },
  visitClose: function () {
    this.setData({
      'visit.visible': false
    })
  },
  visitSubmit: function () {
    if (!this.data.visit.data.visitContent) {
      this.showTopTips('请输入回访备注')
      return
    }

    this.setData({ 'visit.loading': true })
    app.post(app.config.orderVisit, this.data.visit.data).then(({ data }) => {
      this.visitClose()
      app.toast('操作成功').then(_ => {
        this.getList()
      })
    }).catch(_ => {
      this.setData({ 'visit.loading': false })
    })
  },
  // 银行审核
  changeBank: function (){
    this.closeBankPass()
    let customerOrderId = this.data.bankPass.orderId || ''
    app.navigateTo(`order?ids=,${customerOrderId}`)
  },
  bankPass: function (event) {
    let isPass = event.currentTarget.dataset.val
    let customerOrderId = event.target.id || this.data.bankPass.orderId || ''
    let promise
    wx.showLoading({ mask: true })
    if (isPass == 1) { // 通过审核
      promise = app.post(app.config.bankPass, { customerOrderId })
    } else if (isPass == 2) { // 不通过审核，全款支付
      promise = app.post(app.config.bankNotPass, { customerOrderId })
    }

    promise && promise.then(_ => {
      app.toast('操作成功').then(_ => {
        this.closeBankPass()
        this.getList()
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
  showBankPass: function (event) {
    this.setData({
      'bankPass.orderId': event.target.id,
      'bankPass.visible': true
    })
  },
  closeBankPass: function () {
    this.setData({
      'bankPass.visible': false
    })
  },


  // 搜索相关=================================================
  // 正在输入
  filterTyping(event) {
    event.detail.value === '' && this.setData({ 'list.ajax': false })
    this.setData({ 'filter.data.keywords': event.detail.value })
    clearTimeout(this.typingId)
    this.typingId = setTimeout(this.search, 1000)
  },
  // 清楚输入
  clearTyping() {
    this.setData({ 'filter.data.keywords': '' })
    this.search()
  },
  // 搜索
  search: function () {
    clearTimeout(this.typingId)
    wx.showLoading()
    this.getList().finally(_ => {
      wx.hideLoading()
    })
  }
})