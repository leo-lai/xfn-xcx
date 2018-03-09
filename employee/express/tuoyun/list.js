// express/tuoyun/list.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'list', // slt
    ids: [],
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
    app.onLogin(userInfo => {
      if (this.options.mode === 'slt') {
        this.setData({
          'mode': this.options.mode,
          'list.rows': 50,
          'ids': this.options.ids ? this.options.ids.split(',') : []
        })
        wx.setNavigationBarTitle({ title: '选择托运单' })
      }
      this.getList()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      app.storage.getItem('exp-tuoyun-list-refresh').then(refresh => {
        if (refresh) {
          app.storage.removeItem('exp-tuoyun-list-refresh')
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
  // 板车列表
  getList: function (page = 1, callback = app.noopFn) {
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({ 'list.loading': true })

    return app.post(app.config.exp.tuoyunList, {
      page, rows: this.data.list.rows, 
      ...this.data.filter.data
    }).then(({ data }) => {
      data.list.forEach(item => {
        item.list.forEach(car => {
          car.checked = this.data.ids.includes(car.goodsCarId + '')
          if (this.data.mode == 'list' || car.checked || car.goodsCarState == 0) {
            car.disabled = false
          }else {
            car.disabled = true
          }
        })
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
  showDrayInfo: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('l-dray-info', item)
    app.navigateTo('add')
  },

  // 选择托运单
  sltCar: function (event) {
    let {index, carIndex} = event.currentTarget.dataset
    let list = this.data.list.data
    let item = list[index].list[carIndex]
    if (item.disabled) return

    item.checked = !item.checked
    this.setData({ 'list.data': list })
  },
  sltCarOk: function () {
    let ids = []
    this.data.list.data.forEach(item => {
      item.list.forEach(carItem => {
        carItem.checked && ids.push(carItem.goodsCarId)
      })
    })

    wx.showLoading({ mask: true })
    app.post(app.config.exp.wuliuAddCar, {
      distributionId: this.options.did,
      goodsCarIds: ids.join(',')
    }).then(_ => {
      app.getPrevPage().then(prevPage => {
        if(prevPage.getList) {
          wx.hideLoading()
          prevPage.getList()
        }else if(prevPage.getInfo) {
          prevPage.getInfo()
        }
        app.back()
      })
    }).catch(_ => {
      wx.hideLoading()
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