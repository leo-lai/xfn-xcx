// pages/customer/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    search: {
      loading: false,
      height: 602,
      inputShowed: false,
      inputVal: '',
      list: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          'search.height': res.windowHeight - 48
        })
      }
    })

    app.onLogin(userInfo => {
      this.setData({ userInfo })
    }, this.route)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  showSearchInput: function () {
    this.setData({
      'search.inputShowed': true
    })
  },
  hideSearchInput: function () {
    this.setData({
      'search.inputVal': '',
      'search.inputShowed': false
    })
  },
  clearSearchInput: function () {
    this.setData({
      'search.inputVal': ''
    })
  },
  inputSearchTyping: function (event) {
    this.setData({
      'search.loading': true,
      'search.inputVal': event.detail.value
    })
    
    clearTimeout(this.searchTimeid)
    this.searchTimeid = setTimeout(_ => {
      this.search(this.data.search.inputVal)
    }, 200)
  },
  search: function (phoneNumber = '') {
    app.post(app.config.customerSearch, { phoneNumber }).then(({data}) => {
      this.setData({
        'search.list': data
      })
    }).finally(_ => {
      this.setData({
        'search.loading': false
      })
    })
  }
})