// pages/customer-list/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    buyWay: app.config.baseData.buyWay,
    filter: {
      type: '',
      loading: false,
      visible: false,
      panel: false,
      history: [],
      state: [
        {
          value: 1,
          name: '待交定金',
          checked: false
        }, {
          value: 3,
          name: '待银行审核',
          checked: false
        }, {
          value: 5,
          name: '待车辆出库',
          checked: false
        }, {
          value: 7,
          name: '待加装',
          checked: false
        }, {
          value: 9,
          name: '待上牌',
          checked: false
        }, {
          value: 11,
          name: '待贴膜',
          checked: false
        }, {
          value: 13,
          name: '待交车',
          checked: false
        },
      ],
      data: {
        buyCarAlready: '',
        paymentWay: '',
        orderStates: '',
        customerUsersSearch: ''
      }
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      // 获取搜索历史记录
      app.storage.getItem('customer_history').then(list => {
        this.setData({
          'filter.state': this.data.filter.state.map(item => {
            let states = this.options.sta ? this.options.sta.split(',') : []
            item.checked = states.includes(item.value + '')
            return item
          }),
          'filter.data.orderStates': this.options.sta || '',
          'filter.history': list || []
        })
      })

      setTimeout(this.getList, 50)
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv3-customer-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('lv3-customer-list-refresh')
          this.getList()
        }
      })
    })
  },
  // 加载更多
  // onReachBottom: function () {
  //   if (app.globalData.userInfo) {
  //     this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
  //   }
  // },
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
  callPhone: function (event) {
    wx.makePhoneCall({ phoneNumber: event.currentTarget.dataset.val })
  },
  // 客户列表
  getList: function (page = 1, callback = app.noopFn) {
    if (page === 1) {
      this.setData({ 'list.more': true })
    }
    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    app.ajax(app.config.customer.allList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      // 兼容非分页返回
      if (!data.list && data.length >= 0) {
        data = {
          rows: 10000,
          page: 1,
          total: data.length, 
          list: data
        }
      }

      data.list = data.list.map(item => {
        item.thumb = item.headPortrait ? app.utils.formatHead(item.headPortrait) : app.config.avatar
        item.customerUsersId = item.customerUsersId || item.CustomerUsersId
        item.customerUsersName = item.customerUsersName || item.CustomerUsersName
        item.paymentWay = item.paymentWay || item.expectWayId
        return item
      })

      this.setData({
        'list.more': data.list.length >= data.rows,
        'list.page': data.page,
        'list.data': data.page === 1 ? data.list : this.data.list.data.concat(data.list)
      })
    }).finally(_ => {
      this.setData({ 'list.loading': false })
      callback(this.data.list.data)
    })
  },
  // 选择销售顾问
  sltSaler: function (event) {
    let item = event.currentTarget.dataset.item
    this.sltedSaler = item
    app.navigateTo('/pages/saler-list/index')
  },
  onSalesChange: function (saler) {
    if(saler) {
      wx.showLoading()
      app.post(app.config.changeSales, {
        customerUsersId: this.sltedSaler.customerUsersId,
        customerUsersOrgId: this.sltedSaler.customerUsersOrgId || '',
        systemUserId: saler.systemUserId
      }).then(_ => {
        this.setData({
          'list.data': this.data.list.data.map(item => {
            if (item.customerUsersOrgId === this.sltedSaler.customerUsersOrgId){
              item.systemUserId = saler.systemUserId
              item.systemUserName = saler.systemUserName
            }
            return item
          })
        })
        app.toast('分配成功')
      }).finally(_ => {
        wx.hideLoading()
      })
    }
  },

  // 搜索相关=================================================
  toggleFilterPanel: function () {
    this.setData({
      'filter.panel': !this.data.filter.panel
    })
  },
  // 过滤搜索
  changeFilterPanel: function(event) {
    let name = event.currentTarget.dataset.name
    let val = event.target.dataset.val
    if(val !== '') {
      val = Number(val)
      let data = {}
      data['filter.data.' + name] = this.data.filter.data[name] === val ? '' : val
      this.setData(data)
    }
  },
  changeFilterState: function (event) {
    let val = event.target.dataset.val
    if(val !== '') {
      val = Number(val)
      let state = this.data.filter.state.map(item => {
        if (item.value === val) {
          item.checked = !item.checked
        }
        return item
      })
      this.setData({
        'filter.state': state,
        'filter.data.orderStates': state.filter(item => item.checked).map(item => item.value).join(',')
      })
    }
  },
  sureFilterPanel: function () {
    this.toggleFilterPanel()
    // this.setData({ 'filter.data.customerUsersSearch': '' })
    this.getList()
  },
  showFilter: function (event) {
    let filterType = event.currentTarget.dataset.val
    if (filterType === this.data.filter.type) {
      this.hideFilter()
    } else {
      this.setData({
        'filter.visible': true,
        'filter.type': filterType
      })
    }
  },
  hideFilter: function (event) {
    this.setData({
      'filter.visible': false,
      'filter.type': ''
    })
  },
  // 正在输入
  filterTyping(event) {
    if (event.detail.value === '') {
      this.setData({
        'list.ajax': false
      })
    }
    this.setData({
      'filter.data.customerUsersSearch': event.detail.value
    })
  },
  // 清楚输入
  clearTyping() {
    this.setData({
      'filter.data.customerUsersSearch': ''
    })
    this.search()
  },
  // 清除搜索历史记录
  clearHistory: function () {
    app.storage.removeItem('customer_history')
    this.setData({
      'filter.history': []
    })
  },
  // 历史搜索
  searchHistory: function (event) {
    this.setData({
      'filter.data.customerUsersSearch': event.target.dataset.val
    })
    this.search()
  },
  // 搜索
  search: function () {
    // 本地记录搜索关键词
    if (this.data.filter.data.customerUsersSearch.trim() && !this.data.filter.history.includes(this.data.filter.data.customerUsersSearch)) {
      let historyData = this.data.filter.history.concat(this.data.filter.data.customerUsersSearch)
      this.setData({
        'filter.history': historyData
      })
      app.storage.setItem('customer_history', historyData)
    }
    this.hideFilter()
    this.getList()
  }
})