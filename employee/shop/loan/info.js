// shop/loan/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: ['申请中', '已通过', '已拒绝'],
    info: null,
    storeInfo: null
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
    app.storage.removeItem('shop-loan-info')
  },
  getInfo: function () {
    app.storage.getItem('shop-loan-info').then(info => {
      if (info) {
        console.log(info)
        info.guidancePriceStr = (info.guidancePrice / 10000).toFixed(2)
        info.annualIncomeImageArr = info.annualIncomeImage ? info.annualIncomeImage.split(',') : []


        let storeInfo = info.organizationVo || {}
        storeInfo.imageArr = storeInfo.imageUrl ? storeInfo.imageUrl.split(',') : []
        storeInfo.businessLicenseArr = storeInfo.businessLicense ? storeInfo.businessLicense.split(',') : []
        storeInfo.fullAddress = storeInfo.provinceName
        if (storeInfo.provinceName !== storeInfo.cityName) {
          storeInfo.fullAddress += storeInfo.cityName
        }
        storeInfo.fullAddress += storeInfo.areaName + storeInfo.address

        this.setData({ info, storeInfo })
      }
    })
  },
  previewImage: function (event) {
    let current = event.target.id
    let urls = event.currentTarget.dataset.urls
    wx.previewImage({
      current, urls
    })
  },
  pass: function (event) { // 审核贷款
    let isPass = event.currentTarget.dataset.val
    wx.showLoading({ mask: true })
    app.post(app.config.shop.loanAudit, {
      applyLoanId: this.data.info.applyLoanId,
      isPass,
      refusalReason: '贷款资料审核不通过，如有疑问，请联系客服：400-1639-989'
    }).then(_ => {
      app.storage.setItem('shop-loan-list-refresh', 1)
      app.toast('审核成功', false).then(_ => {
        this.setData({
          'info.loneState': isPass == 0 ? 2 : 1
        })
      })
    }).catch(_ => {
      wx.hideLoading()
    })
  }
})