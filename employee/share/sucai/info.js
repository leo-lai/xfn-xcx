// share/sucai/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin().then(_ => {
      this.getInfo()
    })
  },

  getInfo: function() {
    wx.showLoading()
    app.post(app.config.share.sucaiInfo, {
      materialId: this.options.id
    }).then(({data}) => {
      data.imageArr = data.image ? data.image.split(',') : []
      this.setData({ info: data })
    }).finally(_ => {
      wx.hideLoading()
    })
  },

  // 上架下架
  upOff: function (event) {
    let overShelf = 0
    let materialId = this.data.info.materialId
    wx.showLoading()
    app.post(app.config.share.sucaiUpOff, {
      materialId, overShelf
    }).then(_ => {
      app.toast('下架成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getList && prevPage.getList()
        })
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  },

  eidtInfo: function() {
    app.storage.setItem('sucai-info', this.data.info)
    app.navigateTo('add?id=' + this.data.info.materialId)
  },
  shareAdd: function () {
    app.storage.setItem('sucai-info', this.data.info)
    app.navigateTo('/share/share/add?id=' + this.data.info.materialId)
  },
  previewImage: function(event) {
    let urls = event.currentTarget.dataset.urls
    let current = event.target.id
    wx.previewImage({
      current, urls
    })
  }
})