// level2/order/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wuliu: app.config.baseData.wuliu,
    info: null
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
  
  },

  // 订购单详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.lv2.orderInfo, { 
      orderId: this.options.id 
    }).then(({ data }) => {
      this.setData({ info: data })
      if (data.pickers.length > 0) {
        this.tabLinkMan(data.pickers[0].id)
      }

      if (data.customers.length > 0) {
        this.tabCustomer(data.customers[0].id)
      }
      
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 编辑订购单信息
  eidtInfo: function () {
    let formData = app.utils.copyObj({
      id: '',
      orgId: '',
      orgName: '',
      orgLinker: '',
      orgPhone: '',
      logisticsType: '',
      pickCarDate: '',
      pickCarAddr: ''
    }, this.data.info)

    app.storage.setItem('lv2-order-info-base', formData)
    app.navigateTo('info-edit')
  },
  // 预览图片
  previewImage: function (event) {
    if (!event.currentTarget.id) return
    let item = event.currentTarget.dataset.item
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [item.idCardPicOn, item.idCardPicOff]
    })
  },
  // 提车人tab
  tabLinkMan: function (event) {
    let id = app.utils.isObject(event) ? event.currentTarget.id : event
    this.setData({
      'info.pickers': this.data.info.pickers.map(item => {
        item.checked = item.id == id
        return item
      })
    })
  },
  // 客户tab
  tabCustomer: function (event) {
    let id = app.utils.isObject(event) ? event.currentTarget.id : event
    this.setData({
      'info.customers': this.data.info.customers.map(item => {
        item.checked = item.id === id
        return item
      })
    })
  },
  // 编辑客户信息
  customerEdit: function (event) {
    let index = event.currentTarget.dataset.index
    let item = this.data.info.customers[index]

    let formData = app.utils.copyObj({
      type: 1,
      orderId: this.data.info.id,
      id: '',
      userName: '',
      userPhone: '',
      idCardPicOn: '',
      idCardPicOff: ''
    }, item)

    app.storage.setItem('lv2-order-customer', formData)
    app.navigateTo(`men?ids={{this.data.info.id}},{{item.id}}&type=1`)
  },
  // 删除客户信息
  customerDel: function (event) {
    wx.showModal({
      title: '是否删除客户',
      content: '该客户的车辆信息也被删除，确定继续？',
      success: res => {
        if(res.confirm) {
          let index = event.currentTarget.dataset.index
          let item = this.data.info.customers[index]

          wx.showLoading({ mask: true })
          app.post(app.config.lv2.orderMen, {
            orderId: this.data.info.id,
            id: item.id,
            isDel: 1
          }).then(({ data }) => {
            app.toast('删除成功', false).then(_ => {
              this.getInfo()
            })
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  }
})