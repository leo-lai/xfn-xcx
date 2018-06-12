// level2/customer-list/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'list', // slt
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
      rows: 10,
      page: 1,
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      if (this.options.mode === 'slt') {
        this.setData({
          'mode': this.options.mode,
          'orgId': this.options.id,
          'list.rows': this.options.rows || 10
        })
        wx.setNavigationBarTitle({ title: '选择门店' })
      }
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('lv2-customer-list-refresh').then(refresh => {
        if(refresh) {
          app.storage.removeItem('lv2-customer-list-refresh')
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
  // 列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })
    
    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.ajax(app.config.consumer.storeList, {
          page, 
          rows: this.data.list.rows,
          ...this.data.filter.data
        }).then(({ data }) => {
          // 如果接口返回的是数组，则转换成分页对象
          if (!data.list && data.length >= 0) {
            data = {
              page: 1,
              rows: data.length + 1,
              total: data.length,
              list: data
            }
          }

          data.list = data.list.map(item => {
            item.checked = item.orgId == this.data.orgId
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
  viewInfo: function (event) {
    let currentItem = event.currentTarget.dataset.item
    if(this.data.mode === 'slt') {
      this.setData({
        'orgId': currentItem.orgId,
        'list.data': this.data.list.data.map(item => {
          item.checked = item.orgId == currentItem.orgId
          return item
        })
      })
      app.getPrevPage().then(prevPage => {
        prevPage.changeStore && prevPage.changeStore(currentItem)
      })
      app.back()
    }else{
      app.storage.setItem('lv2-customer-info', currentItem)
      app.navigateTo('add?id=' + currentItem.orgId)
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