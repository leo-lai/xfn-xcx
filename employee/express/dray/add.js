// express/dray/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      logisticsCarId: '',
      licensePlateNumber: '',
      consignmentType: 1,
      logisticsCarVacancy: '',
      gpsPIN: '',
      remarks: ''
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.storage.getItem('l-dray-info').then(info => {
      if (info) {
        this.setData({
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
  onUnload: function () {
    app.storage.removeItem('l-dray-info')
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
    let value = event.detail.value

    console.log(id, value)
    data['formData.' + id] = value
    this.setData(data)
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.licensePlateNumber) {
      this.showTopTips('请输入板车车牌号')
      return
    }
    if (!this.data.formData.consignmentType) {
      this.showTopTips('请选择运输类型')
      return
    }
    if (!this.data.formData.logisticsCarVacancy) {
      this.showTopTips('请输入运输车辆数量')
      return
    }

    wx.showLoading({ mask: true })
    app.post(app.config.exp.drayAdd, this.data.formData)
      .then(({ data }) => {
        app.toast('保存成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            prevPage.getList && prevPage.getList()
          })
        })
      }).catch(err => {
        wx.hideLoading()
      })
  }
})