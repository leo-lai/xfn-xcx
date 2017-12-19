// pages/customer-list/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    customerType: ['预约客户', '落定客户', '贷款通过客户', '待完款客户', '待加装客户', '待提车客户'],
    buyWay: app.config.baseData.buyWay,
    storeList: [],
    salesList: {
      visible: false,
      height: 602 - 200,
      loading: false,
      slted: {},
      list: [],
      data: {
        customerUsersOrgId: '',
        systemUserId: ''
      }
    },
    search: {
      loading: false,
      height: 602,
      inputShowed: false,
      inputVal: '',
      list: []
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      filter: {
        customerType: '',
        orgId: ''
      },
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      let customerType = Number(options.type) || 0
      this.setData({ 
        userInfo,
        'list.filter.customerType': customerType
      })

      wx.setNavigationBarTitle({
        title: this.data.customerType[customerType]
      })

      this.getStoreList()
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 加载更多
  onReachBottom: function () {
    if (this.data.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })

    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 门店列表
  getStoreList: function () {
    app.post(app.config.storeList).then(({ data }) => {
      this.setData({
        'storeList': data
      })
    })
  },
  // 客户列表
  getList: function (page = 1, callback = app.noopFn) {
    if (page === 1) {
      this.setData({
        'list.more': true
      })
    }
    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({
      'list.loading': true
    })

    let url = this.data.list.filter.customerType === 0 ? app.config.customerBespeak : app.config.customerOrder
    app.post(url, {
      page, ...this.data.list.filter
    }).then(({ data }) => {
      // 兼容非分页返回
      if (!data.list && data.length >= 0) {
        data = {
          rows: 10,
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
      this.setData({
        'list.loading': false
      })
      callback(this.data.list.data)
    })
  },
  showSearchInput: function () {
    this.setData({
      'search.inputShowed': true
    })
  },
  hideSearchInput: function () {
    this.setData({
      'search.inputVal': '',
      'search.inputShowed': false
    })
  },
  clearSearchInput: function () {
    this.setData({
      'search.inputVal': ''
    })
  },
  inputSearchTyping: function (event) {
    this.setData({
      'search.loading': true,
      'search.inputVal': event.detail.value
    })

    clearTimeout(this.searchTimeid)
    this.searchTimeid = setTimeout(_ => {
      this.search(this.data.search.inputVal)
    }, 200)
  },
  search: function (phoneNumber = '') {
    app.post(app.config.customerSearch, { phoneNumber }).then(({ data }) => {
      this.setData({
        'search.list': data
      })
    }).finally(_ => {
      this.setData({
        'search.loading': false
      })
    })
  },
  // 销售顾问列表
  getSalesList: function (event) {
    let slted = event.currentTarget.dataset.item
    wx.showLoading()
    app.post(app.config.salesList).then(({ data }) => {
      this.data.salesList.data.customerUsersOrgId = slted.customerUsersOrgId
      this.setData({
        'salesList.visible': true,
        'salesList.list': data.map(item => {
          item.checked = false
          if (item.systemUserId === slted.systemUserId) {
            item.checked = true
          }
          return item
        })
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  sltSalesList: function (event) {
    let slted = event.currentTarget.dataset.item
    this.setData({
      'salesList.slted': slted,
      'salesList.list': this.data.salesList.list.map(item => {
        item.checked = false
        if (item.systemUserId === slted.systemUserId) {
          item.checked = true
        }
        return item
      })
    })
    this.data.salesList.data.systemUserId = slted.systemUserId
    wx.showLoading()
    app.post(app.config.changeSales, this.data.salesList.data).then(_ => {
      app.toast('分配成功').then(_ => {
        this.getList()
        this.setData({
          'salesList.visible': false
        })
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },
  closeSalesList: function () {
    this.setData({
      'salesList.visible': false
    })
  }
})