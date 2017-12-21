// pages/customer/index.js
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    search: {
      height: 602,
      doing: false,
      typing: false,
      keyword: '',
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
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  showSearchInput: function () {
    this.setData({ 'search.typing': true })
  },
  hideSearchInput: function () {
    this.setData({
      'search.keyword': '',
      'search.typing': false
    })
  },
  clearSearchInput: function () {
    this.setData({ 'search.keyword': '' })
  },
  inputSearchTyping: function (event) {
    this.setData({
      'search.doing': true,
      'search.keyword': event.detail.value
    })
    
    clearTimeout(this.searchTimeid)
    this.searchTimeid = setTimeout(_ => {
      this.search(this.data.search.keyword)
    }, 200)
  },
  search: function (phoneNumber = '') {
    app.post(app.config.customerSearch, { phoneNumber }).then(({data}) => {
      this.setData({ 'search.list': data })
    }).finally(_ => {
      this.setData({ 'search.doing': false })
    })
  }
})