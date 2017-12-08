//index/index.js
const app = getApp()
Page({
  data: {
    userInfo: {},
    history: {
      data: []
    },
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      data: []
    },
    filter: {
      loading: false,
      visible: false,
      type: '',
      brandId: '',
      priceId: '',
      typeId: '',
      data: {
        brandId: '',
        minPrice: '',
        maxPrice: '',
        vehicleName: '',
        carsName: ''
      }
    },
    brandList: [],
    priceList: [
      {
        id: 0,
        name: '全部',
        value: []
      },
      {
        id: 1,
        name: '5-10万',
        value: [50000, 100000]
      },
      {
        id: 2,
        name: '10-15万',
        value: [100000, 150000]
      },
      {
        id: 3,
        name: '15-20万',
        value: [150000, 200000]
      },
      {
        id: 4,
        name: '20-25万',
        value: [200000, 250000]
      },
      {
        id: 5,
        name: '25-30万',
        value: [250000, 300000]
      },
      {
        id: 6,
        name: '30万以上',
        value: [300000]
      }
    ],
    typeList: [
      {
        id: 0,
        image: app.config.resURL + '/car-type-1.jpg',
        name: '小型车'
      },
      {
        id: 1,
        image: app.config.resURL + '/car-type-2.jpg',
        name: '紧凑型车'
      },
      {
        id: 2,
        image: app.config.resURL + '/car-type-3.jpg',
        name: '中型车'
      },
      {
        id: 3,
        image: app.config.resURL + '/car-type-4.jpg',
        name: '大型车'
      },
      {
        id: 4,
        image: app.config.resURL + '/car-type-5.jpg',
        name: 'SUV'
      },
      {
        id: 5,
        image: app.config.resURL + '/car-type-6.jpg',
        name: 'MPV'
      }
    ]
  },
  onLoad: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })

      this.getList(1, _ => {
        this.getBrandList()
        setTimeout(_ => {
          this.getOrderInfo()
        }, 600)
      })

      // 获取搜索历史记录
      app.storage.getItem('search_history').then((value) => {
        this.setData({
          'history.data': value || []
        })
      })
    })
  },
  onReachBottom: function () { // 加载更多
    if (this.data.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  onPullDownRefresh: function () { // 下拉刷新
    if (this.data.userInfo) {
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })
      
    } else {
      wx.stopPullDownRefresh()
    }
  },
  sltFilter: function (event) {
    let filterType = event.currentTarget.dataset.val
    if(filterType === this.data.filter.type) {
      this.hideFilter()
    }else{
      this.setData({
        'filter.visible': true,
        'filter.type': filterType
      })
    }
  },
  filterSearch: function(event) {
    let item = event.currentTarget.dataset.item
    let data = {}
    switch (this.data.filter.type) {
      case 1:
        if(this.data.filter.brandId !== item.id) {
          data['filter.brandId'] = item.id
          data['filter.data.brandId'] = item.id
        }else {
          data['filter.brandId'] = ''
          data['filter.data.brandId'] = ''
        }
        break
      case 2:
        if (this.data.filter.priceId !== item.id) {
          data['filter.priceId'] = item.id
          data['filter.data.minPrice'] = item.value[0] || ''
          data['filter.data.maxPrice'] = item.value[1] || ''
        }else{
          data['filter.priceId'] = ''
          data['filter.data.minPrice'] = ''
          data['filter.data.maxPrice'] = ''
        }
        break
      case 3:
        if (this.data.filter.typeId !== item.id) {
          data['filter.typeId'] = item.id
          data['filter.data.vehicleName'] = item.name
        }else{
          data['filter.typeId'] = ''
          data['filter.data.vehicleName'] = ''
        }
        break
    }
    this.setData(data)
    this.getList()
  },
  hideFilter: function (event) {
    this.setData({
      'filter.visible': false,
      'filter.type': ''
    })
  },
  getList: function (page = 1, callback = app.noop) {
    if(page === 1) {
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
    
    app.post(app.config.carList, {
      page, ...this.data.filter.data
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.priceStr = (item.price / 10000).toFixed(2)
        item.thumb = app.utils.formatThumb(item.image, 200)
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
  getOrderInfo: function() {
    app.post(app.config.orderInfo).then(({data}) => {
      if(data) {
        app.navigateTo('../order-info/index')
      }
    })
  },
  getBrandList: function () {
    app.post(app.config.brandList).then(({data}) => {
      this.setData({
        'brandList': data
      })
    })
  },
  searchInput(event) {
    if (event.detail.value === '') {
      this.setData({
        'list.ajax': false
      })
    }
    this.setData({
      'filter.data.carsName': event.detail.value
    })
  },
  clearSearch() {
    this.setData({
      'filter.data.carsName': ''
    })
  },
  // 清除搜索历史记录
  clearHistory: function () {
    app.storage.removeItem('search_history')
    this.setData({
      'history.data': []
    })
  },
  // 历史搜索
  searchHistory: function (event) {
    this.setData({
      'filter.data.carsName': event.target.dataset.val
    })
    this.search()
  },
  // 关闭搜索
  closeSearch: function() { 
    this.setData({
      'filter.visible': false,
      'filter.type': ''
    })
  },
  // 取消搜索
  cancelSearch: function() {
    if(!this.data.filter.carsName && this.data.list.data.length === 0){
      this.getList(1)
    }
    this.closeSearch()
  },
  // 搜索
  search: function () {
    // 本地记录搜索关键词
    if (this.data.filter.data.carsName.trim() && !this.data.history.data.includes(this.data.filter.data.carsName)) {
      let historyData = this.data.history.data.concat(this.data.filter.data.carsName)
      this.setData({
        'history.data': historyData
      })
      app.storage.setItem('search_history', historyData)
    }
    this.closeSearch()
    this.getList()
  }
})
