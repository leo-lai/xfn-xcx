// express/driver/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {
      driverId: '',
      realName: '',
      phoneNumber: '',
      cardNo: '',
      idcardPicOn: '',
      idcardPicOff: ''
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },

  getInfo: function () {
    wx.showLoading()
    app.post(app.config.exp.driverInfo, {
      driverId: this.options.id
    }).then(({data}) => {
      this.setData({ 'info': data })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  previewImage: function (event) {
    wx.previewImage({
      current: event.currentTarget.id, 
      urls: [this.data.info.idcardPicOn, this.data.info.idcardPicOff]
    })
  },
  del: function () {
    wx.showModal({
      content: '是否确定删除司机信息？',
      success: res => {
        if(res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.exp.driverDel, {
            driverId: this.data.info.driverId
          }).then(_ => {
            app.toast('删除成功', true).then(_ => {
              app.getPrevPage().then(prevPage => {
                prevPage.getList && prevPage.getList()
              })
            })
          }).finally(_ => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  edit: function () {
    app.storage.setItem('l-driver-info', this.data.info)
    app.navigateTo('add')
  }
})