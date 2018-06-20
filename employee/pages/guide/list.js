// pages/school/list.js
const app = getApp()
const resURL = app.config.resURL
Page({
  noopFn: app.noopFn,
  data: {
    resURL,
    list: {
      ajax: false,
      loading: false,
      more: true,
      page: 1,
      rows: 50,
      data: [
        {
          id: 1,
          title: '小程序首页操作说明',
          src: resURL + '/videos/100.mp4'
        }, {
          id: 2,
          title: '海报助手操作说明',
          src: resURL + '/videos/110.mp4'
        }, {
          id: 3,
          title: '报价单操作说明',
          src: resURL + '/videos/120.mp4'
        }, {
          id: 4,
          title: '喜蜂鸟学堂操作说明',
          src: resURL + '/videos/130.mp4'
        }, {
          id: 5,
          title: '商城管理-在售车辆操作说明',
          src: resURL + '/videos/141.mp4'
        }, {
          id: 6,
          title: '商城管理-寻车管理操作说明',
          src: resURL + '/videos/142.mp4'
        }, {
          id: 7,
          title: '商城管理-热销活动操作说明',
          src: resURL + '/videos/143.mp4'
        }, {
          id: 8,
          title: '资源开单操作说明',
          src: resURL + '/videos/200.mp4'
        }, {
          id: 9,
          title: '资源单收定金操作说明',
          src: resURL + '/videos/201.mp4'
        }, {
          id: 10,
          title: '资源单配车和验车操作说明',
          src: resURL + '/videos/202.mp4'
        }, {
          id: 11,
          title: '资源单申请退款操作说明',
          src: resURL + '/videos/203.mp4'
        }, {
          id: 12,
          title: '客户管理操作说明',
          src: resURL + '/videos/300.mp4'
        }, {
          id: 13,
          title: '客户添加操作说明',
          src: resURL + '/videos/301.mp4'
        }, {
          id: 14,
          title: '客户开单操作说明',
          src: resURL + '/videos/400.mp4'
        }, {
          id: 15,
          title: '客户单收定金操作说明',
          src: resURL + '/videos/401.mp4'
        }, {
          id: 16,
          title: '客户单银行审核操作说明',
          src: resURL + '/videos/402.mp4'
        }, {
          id: 17,
          title: '车辆入库操作说明',
          src: resURL + '/videos/403.mp4'
        }, {
          id: 18,
          title: '车辆出库操作说明',
          src: resURL + '/videos/404.mp4'
        }, {
          id: 19,
          title: '加装上牌操作说明',
          src: resURL + '/videos/405.mp4'
        }
      ]
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {
    app.onLogin(userInfo => {
      // this.getList()
    }, this.route)
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
  // 分享列表
  getList: function (page = 1, callback = app.noopFn) {
    let rows = this.data.list.rows
    page === 1 && this.setData({ 'list.more': true })

    if (!this.data.list.more || this.data.list.loading) {
      callback(this.data.list.data)
      return
    }

    this.setData({ 'list.loading': true })
    return app.ajax(app.config.school.list, {
      page, rows
    }).then(({ data }) => {
      // 兼容非分页返回
      data = data || []
      if (!data.list && data.length >= 0) {
        data = {
          total: data.length,
          list: data
        }
      }

      data.list = data.list.map(item => {
        item.thumb = app.utils.formatThumb(item.icon, 150)
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
  }
})