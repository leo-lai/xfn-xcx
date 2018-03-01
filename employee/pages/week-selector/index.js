// pages/week-selector/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkboxItems: [
      { name: '周日' },
      { name: '周一' },
      { name: '周二' },
      { name: '周三' },
      { name: '周四' },
      { name: '周五' },
      { name: '周六' }
    ]
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)

    var checkboxItems = this.data.checkboxItems, values = e.detail.value

    checkboxItems.forEach(item => {
      if (values.includes(item.name)) {
        item.checked = true
      }else{
        item.checked = false
      }
    })

    this.setData({ checkboxItems })
  },

  submit: function () {
    let value = this.data.checkboxItems.filter(item => item.checked).map(item => item.name)

    app.getPrevPage().then(prevPage => {
      prevPage.sendTimeCb && prevPage.sendTimeCb(value)
      app.back()
    })
  }
})