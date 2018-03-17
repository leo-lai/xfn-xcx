// express/tuoyun/contract.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    consignmentType: ['无', '普通', '专线'],
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getInfo()
  },
  onShareAppMessage: function () {
    return {
      title: '喜蜂鸟物流运输合同'
    }
  },
  // 订购单详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.exp.contract, {
      consignmentId: this.options.id
    }).then(({ data }) => {
      // data.createTimeStr = app.utils.str2date(data.createTime).format('yyyy年MM月dd日')
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  }
})