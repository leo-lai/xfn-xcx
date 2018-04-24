// shop/seek/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOffer: false,
    info: null,
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('shop-seek-info')
  },
  getInfo: function () {
    app.storage.getItem('shop-seek-info').then(seekInfo => {
      if (seekInfo) {
        let info = null, isOffer = false
        if (seekInfo.findCarOfferId) {
          isOffer = true
          info = seekInfo.shopFindCar
          info.findCarOffers = [app.utils.copyObj({
            createDate: '',
            findCarId: '',
            findCarOfferId: '',
            location: '',
            offerAmount: '',
            offerState: '',
            orgId: '',
            orgName: '',
            overdueDate: '',
            systemUserId: '',
            systemUserName: '',
            systemUserPhone: '',
          }, seekInfo)]
        }else {
          info = seekInfo
        }

        info.guidancePriceStr = (info.guidancePrice / 10000).toFixed(2)
        this.setData({ isOffer, info })
      }
    })
  }
})