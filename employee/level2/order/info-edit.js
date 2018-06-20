// level2/order/info-edit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    wuliu: { // 物流方式
      index: -1,
      list: app.config.baseData.wuliu
    },
    formData: {
      id: '',
      orgId: '',
      orgName: '',
      orgLinker: '',
      orgPhone: '',
      orderType: 1,
      logisticsType: '',
      freight: '',
      pickCarDate: '',
      pickCarAddr: '',
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    app.storage.getItem('lv2-order-info-base').then(info => {
      if(info) {
        this.setData({
          'wuliu.index': info.logisticsType - 1,
          'formData': info
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
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.storage.removeItem('lv2-order-info-base')
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({ topTips })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({ topTips: '' })
    }, 3000)
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
        case 'logisticsType':
          value = value + 1
          break
        case 'orgId':
          value = this.data[picker].list[value][id]
          break
        default:
          value = this.data[picker].list[value]
          break
      }
    }
    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 选择门店
  changeStore: function (storeInfo) {
    console.log(storeInfo)
    if (storeInfo) {
      this.setData({
        'formData.orgId': storeInfo.orgId,
        'formData.orgName': storeInfo.shortName,
        'formData.orgLinker': storeInfo.linkMan,
        'formData.orgPhone': storeInfo.telePhone
      })
    }
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.orgId) {
      this.showTopTips('请选择门店名称')
      return
    }
    if (!this.data.formData.orgLinker) {
      this.showTopTips('请输入联系人姓名')
      return
    }
    if (!this.data.formData.orgPhone) {
      this.showTopTips('请输入联系电话')
      return
    }
    if (!this.data.formData.logisticsType) {
      this.showTopTips('请选择物流方式')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.consumer.orderEdit, this.data.formData).then(({ data }) => {
      app.toast('保存成功', true).then(_ => {
        app.getPrevPage().then(prevPage => {
          prevPage.getInfo && prevPage.getInfo()
        })
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})