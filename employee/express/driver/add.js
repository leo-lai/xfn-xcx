// express/driver/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      driverId: '',
      realName: '',
      phoneNumber: '',
      cardNo: '',
      idcardPicOn: '',
      idcardPicOff: ''
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.storage.getItem('l-driver-info').then(info => {
      if(info) {
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
    app.storage.removeItem('l-driver-info')
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
    if (!this.data.formData.realName) {
      this.showTopTips('请输入姓名')
      return
    }
    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入11位手机号')
      return
    }
    if (!this.data.formData.cardNo) {
      this.showTopTips('请输入司机身份证号')
      return
    }
    if (!this.data.formData.idcardPicOn) {
      this.showTopTips('请上传身份证正面照')
      return
    }
    if (!this.data.formData.idcardPicOff) {
      this.showTopTips('请上传身份证反面照')
      return
    }
    wx.showLoading({ mask: true })
    app.post(app.config.exp.driverAdd, this.data.formData)
      .then(({ data }) => {
        app.toast('保存成功', true).then(_ => {
          app.getPrevPage().then(prevPage => {
            if (this.data.formData.driverId) {
              prevPage.getInfo()
            } else {
              prevPage.getList()
            }
          })
        })
      }).catch(err => {
        wx.hideLoading()
      })
  }
})