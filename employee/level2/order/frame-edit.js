// level2/order/frame-edit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAjax: false,
    frameList: [],
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.storage.getItem('lv2-order-car-info').then(info => {
      console.log(info)
      this.setData({ info })
    })
  },
  // 获取车架号列表
  getFrameList: function () {
    wx.showLoading()
    app.post(app.config.lv2.frameList, {
      infoId: this.ids[0]
    }).then(({ data }) => {
      this.setData({
        'isAjax': true,
        'frameList': data || []
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 保存车架号
  submit: function () {
    if (!this.data.formData.stockCarId) {
      wx.showModal({
        content: '请选择车架号',
        showCancel: false
      })
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.lv2.carMatch2, this.data.formData)
      .then(_ => {
        app.toast('配车成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            prevPage.getCarFrame && prevPage.getCarFrame()
          })
        })
      }).finally(_ => {
        wx.hideLoading()
      })
  }
})