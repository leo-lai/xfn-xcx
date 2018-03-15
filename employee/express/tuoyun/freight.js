// express/tuoyun/freight.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consignmentType: ['', '普通', '专线'],
    info: {},
    carList: []
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      app.storage.getItem('exp-tuoyun-freight').then(info => {
        if(info) {
          this.setData({ info })
          app.getPrevPage().then(prevPage => {
            this.setData({
              carList: prevPage.data.carList
            })
          })
        }
      })
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },
  // 表单输入
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let value = event.detail.value

    console.log(id, value)
    data['info.' + id] = value
    this.setData(data)
  },

  // 生成订单
  submit: function () {
    if (this.data.info.amount < 0) {
      wx.showModal({
        content: '请输入总运费',
        showCancel: false
      })
      return
    }

    app.getPrevPage().then(prevPage => {
      let formData = Object.assign({}, prevPage.data.formData, this.data.info)
      wx.showLoading({ mask: true })
      app.json(app.config.exp.tuoyunAdd, formData)
        .then(({ data }) => {
          app.toast('订单生成成功').then(_ => {
            app.storage.setItem('exp-tuoyun-list-refresh', 1)
            app.back(2)
          })
        }).finally(_ => {
          wx.hideLoading()
        })
    })
  }
})