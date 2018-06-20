// level2/order/frame-edit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    isAjax: false,
    frameList: [],
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.storage.getItem('lv2-order-car-info').then(info => {
      console.log(info)
      this.setData({ info })
      this.getCarFrames()
    })
  },
  // 获取订单车辆列表
  getCarFrames: function () {
    wx.showLoading()
    app.ajax(app.config.consumer.carFrames, {
      infoId: this.options.id
    }).then(({ data }) => {
      this.setData({
        'isAjax': true,
        'frameList': data || []
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({ topTips })
    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({ topTips: '' })
    }, 3000)
  },
  // 输入车架号
  frameInput: function (event) {
    let frameList = this.data.frameList
    let index = event.target.dataset.index
    let value = event.detail.value

    frameList[index].vin = value
    this.setData({ frameList })
  },
  // 保存车架号
  submit: function () {
    let formData = {
      orderId: this.data.info.orderId,
      cars: ''
    }
    let cars = []
    this.data.frameList.forEach(item => {
      cars.push(item.id + '|' + (item.vin || ''))
    })
    formData.cars = cars.join(',')

    wx.showLoading({ mask: true })
    app.post(app.config.consumer.framesEdit, formData)
      .then(_ => {
        app.toast('保存成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            prevPage.getList && prevPage.getList()
            prevPage.getInfo && prevPage.getInfo()
          })
        })
      }).finally(_ => {
        wx.hideLoading()
      })
  }
})