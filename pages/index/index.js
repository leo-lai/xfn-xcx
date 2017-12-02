//index/index.js
const app = getApp()
Page({
  data: {
    userInfo: {},
    list: {
      loading: false,
      more: true,
      page: 1,
      data: []
    },
    filterBrand: [
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '丰田'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '本田'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '广汽传祺'
      }
    ],
    filterPrice: [
      {
        name: '全部'
      },
      {
        name: '5-10万'
      },
      {
        name: '10-15万'
      },
      {
        name: '15-20万'
      },
      {
        name: '20-25万'
      },
      {
        name: '25-30万'
      },
      {
        name: '30万以上'
      }
    ],
    filterType: [
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '小型车'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '紧凑型车'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '中型车'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: '大型车'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: 'SUV'
      },
      {
        image: 'https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=icon&w=50&h=50',
        name: 'MPV'
      }
    ]
  },
  onLoad: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })

      // this.getList()
    })
  },
  onReachBottom: function () { // 加载更多
    if (this.data.userInfo) {
      this.getList(this.data.list.data.length > 0 ? this.data.list.page + 1 : 1)
    }
  },
  onPullDownRefresh: function () { // 下拉刷新
    if (this.data.userInfo) {
      this.setData({
        'list.more': true
      })
      this.getList(1, _ => {
        wx.stopPullDownRefresh()
      })
      
    } else {
      wx.stopPullDownRefresh()
    }
  },
  getList: function (page = 1, callback = app.noop) {
    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }
    this.setData({
      'list.loading': true
    })

    app.post(app.config.carList, {
      page
    }).then(({ data }) => {
      data.list = data.list.map(item => {
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
  }
})
