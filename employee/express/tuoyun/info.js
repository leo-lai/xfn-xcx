// express/tuoyun/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consignmentType: ['','普通','专线'],
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getInfo()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },

  getInfo: function () {
    wx.showLoading({ mask: true })
    app.post(app.config.exp.tuoyunInfo, { 
      consignmentId: this.options.id
    }).then(({data}) => {
      this.setData({
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },

  // 编辑对接人，提车人信息
  editMen: function (event) {
    let menType = event.currentTarget.dataset.type
    let item = event.currentTarget.dataset.item

    app.storage.setItem('exp-tuoyun-customer', item)
    app.navigateTo(`men?type=${menType}&ids=${this.data.info.consignmentId}`)
  }

})