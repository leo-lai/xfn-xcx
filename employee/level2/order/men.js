// level2/order/linker.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    men: '提车人',
    formData: {
      type: 2,
      orderId: '',
      id: '',
      userName: '',
      userPhone: '',
      idCardPicOn: '',
      idCardPicOff: ''
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let ids = this.options.ids ? this.options.ids.split(',') : []
    this.setData({ 
      'formData.type': this.options.type,
      'formData.orderId': ids[0],
      'formData.id': ids[1] || '',
      'men': this.options.type == 1 ? '客户' : '提车人'
    })
    if (this.options.type == 1) {
      wx.setNavigationBarTitle({ title: '客户信息' })
    }else {
      wx.setNavigationBarTitle({ title: '提车人信息' })
    }

    app.storage.getItem('lv2-order-customer').then(info => {
      if (info) {
        this.setData({
          'formData': Object.assign({}, this.data.formData, info)
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
    app.storage.removeItem('lv2-order-customer')
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
  // 选择图片
  chooseImage: function (event) {
    let id = event.currentTarget.id
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 上传图片到服务器
        wx.showLoading({
          title: '照片上传中'
        })
        wx.uploadFile({
          url: app.config.uploadFile,
          filePath: res.tempFiles[0].path,
          name: 'img_file',
          success: res => {
            console.log(res)
            if (res.statusCode === 200) {
              if (typeof res.data === 'string') {
                res.data = JSON.parse(res.data)
              }

              let tempData = {}
              tempData['formData.' + id] = res.data.data
              this.setData(tempData)
              console.log(tempData)
              wx.hideLoading()
            } else {
              wx.showToast({
                image: '../../images/error.png',
                title: '上传失败(' + res.statusCode + ')'
              })
            }
          },
          fail: res => {
            wx.showToast({
              image: '../../images/error.png',
              title: '照片上传失败'
            })
          }
        })
      }
    })
  },
  // 保存信息
  submit: function () {
    if (!this.data.formData.userName) {
      this.showTopTips('请输入姓名')
      return
    }
    if (!this.data.formData.userPhone) {
      this.showTopTips('请输入11位手机号')
      return
    }
    if (!this.data.formData.idCardPicOn) {
      this.showTopTips('请上传身份证正面照')
      return
    }
    if (!this.data.formData.idCardPicOff) {
      this.showTopTips('请上传身份证反面照')
      return
    }
    wx.showLoading({ mask: true })
    app.post(this.data.formData.id ? app.config.lv2.orderEditMen : app.config.lv2.orderAddMen, this.data.formData)
    .then(({ data }) => {
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