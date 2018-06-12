// level3/customer/details.js
const app = getApp()
let ship = ['家人', '亲戚', '朋友', '同事']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex: {
      index: -1,
      list: ['男', '女']
    },
    income: {
      index: -1,
      list: ['工资', '金融理财', '个体经营', '其他']
    },
    house: {
      index: -1,
      list: ['租借', '按揭', '自有', '父母']
    },
    edu: {
      index: -1,
      list: ['博士', '硕士', '本科', '大专', '高中', '其他']
    },
    driverLicense: ['无', '有'],
    shipA: {
      index: -1,
      list: ship
    },
    shipB: {
      index: -1,
      list: ship
    },
    customerInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
      app.storage.getItem('customer-details').then(customerInfo => {
        customerInfo.thumb = customerInfo.headPortrait ? app.utils.formatHead(customerInfo.headPortrait) : app.config.avatar,
        this.setData({
          customerInfo,
          'sex.index': Number(customerInfo.agentGender) - 1,
          'income.index': this.data.income.list.findIndex(item => item === customerInfo.incomeSource),
          'house.index': this.data.house.list.findIndex(item => item === customerInfo.housingSource),
          'edu.index': this.data.edu.list.findIndex(item => item === customerInfo.education),
          'shipA.index': this.data.shipA.list.findIndex(item => item === customerInfo.emergencyARelationship),
          'shipB.index': this.data.shipB.list.findIndex(item => item === customerInfo.emergencyBRelationship)
        })
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
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if (picker) {
      value = Number(value)
      data[picker + '.index'] = value
      switch (id) {
        case 'agentGender':
          value = value + 1
          break
        default:
          value = this.data[picker].list[value]
          break
      }
    }
    data['customerInfo.' + id] = value
    this.setData(data)
  },
  submit: function () {
    if (!this.data.customerInfo.customerUsersName) {
      this.showTopTips('请填写客户姓名')
      return
    }
    if (!this.data.customerInfo.phoneNumber) {
      this.showTopTips('请填写客户电话')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.customerDetails, this.data.customerInfo).then(({ data }) => {
      app.getPrevPage().then(prevPage => {
        prevPage.setData({ 'customerInfo': this.data.customerInfo })
      })
      app.toast('保存成功', true)
    }).catch(err => {
      wx.hideLoading()
    })
  }
})