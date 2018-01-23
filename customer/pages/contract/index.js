// pages/contract/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resURL: app.config.resURL,
    bank: [
      { id: 1, name: '奇瑞金融' },
      { id: 2, name: '瑞福德金融' },
      { id: 3, name: '建设银行' },
      { id: 4, name: '农业银行' },
      { id: 5, name: '工商银行' },
      { id: 6, name: '广州银行' },
      { id: 7, name: '鹤山珠江村镇银行' },
      { id: 8, name: '鹤山农村信用合作社' }
    ],
    info: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.getInfo()
    }, this.route)
    
  },

  getInfo: function() {
    wx.showLoading()
    app.post(app.config.contractInfo, {
      customerOrderId: this.options.id
    }).then(({data}) => {
      data.followInformation = data.followInformation ? data.followInformation.replace(/\,/g, '，') : ''
      data.loanBankName = this.getBankName(data.loanBank)
      this.setData({info: data})
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  getBankName: function(id) {
    return (this.data.bank.filter(item => item.id === id)[0] || {}).name || '无'
  }
})