// pages/guide/index.js
const app = getApp()
const resURL = app.config.resURL
Page({

  /**
   * 页面的初始数据
   */
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
    },
    current: null
  },

  onReady: function () {
    let current = this.data.list.data.filter(item => item.id == this.options.id)[0]
    this.setData({ current })
    this.videoContext = wx.createVideoContext('myVideo')
    wx.setNavigationBarTitle({
      title: current.title,
    })
  },

  videoPlay: function () {
    this.videoContext.requestFullScreen()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '淘车快商户版操作指南'
    }
  }
})