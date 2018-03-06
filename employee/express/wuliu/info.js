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
    app.post(app.config.exp.wuliuInfo, { 
      distributionId: this.options.id
    }).then(({data}) => {
      let ids = []
      let tuoyunList = {}
      data.goodsCars.forEach(carItem => {
        ids.push(carItem.goodsCarId)
        if (tuoyunList[carItem.consignmentCode]) {
          tuoyunList[carItem.consignmentCode].amount += 0
          tuoyunList[carItem.consignmentCode].carList.push(carItem)
        } else {
          tuoyunList[carItem.consignmentCode] = {
            consignmentId: carItem.consignmentId,
            consignmentCode: carItem.consignmentCode,
            startingPointAddress: carItem.startingPointAddress,
            destinationAddress: carItem.destinationAddress,
            amount: 0,
            carList: [carItem]
          }
        }
      })
      data.ids = ids.join(',')
      data.tuoyunList = tuoyunList

      this.setData({
        info: data
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  }

})