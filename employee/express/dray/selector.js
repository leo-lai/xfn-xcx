// express/dray/selector.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    consignmentType: ['普通', '专线'],
    filter: {
      loading: false,
      visible: false,
      data: {
        keywords: ''
      }
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      data: []
    },
    slted: {
      logisticsCarId: '',
      licensePlateNumber: '',
      consignmentType: '',
      logisticsCarVacancy: ''
    }
  },
  onReady: function (options) {
    app.onLogin(userInfo => {
      this.getList()
    }, this.route)
  },
  
  onShow: function () {
    app.checkLogin()
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
  // 板车列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    return app.post(app.config.exp.draySlt, {
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

  // 选择板车
  slt: function (event) {
    let id = event.currentTarget.id
    let list = this.data.list.data
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        let slted = {
          logisticsCarId: list[i].id,
          licensePlateNumber: list[i].name,
          logisticsCarVacancy: list[i].number,
          consignmentType: list[i].consignmentType,
        }
        this.setData({ slted })
        app.getPrevPage().then(prevPage => {
          prevPage.drayCb && prevPage.drayCb(slted)
        })

        app.back()
        break
      }
    }
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