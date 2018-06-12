// level2/order/add.js
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
      orgId: '',
      orgName: '',
      orgLinker: '',
      orgPhone: '',
      orderType: 1,
      logisticsType: '',
      freight: '',
      pickCarDate: '',
      pickCarAddr: '',
      pickers: []
    },
    pickerData: {
      userName: '',
      userPhone: '',
      idCardPicOn: '',
      idCardPicOff: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (options) {
    if (this.options.aid) {
      this.setData({
        'formData.advanceOrderId': this.options.aid
      })
      app.storage.getItem('shop-order-info').then(info => {
        if (info) {
          let formData = {
            orgId: info.organizationVo.orgId,
            orgName: info.organizationVo.shortName,
            orgLinker: info.organizationVo.linkMan,
            orgPhone: info.organizationVo.telePhone,
            freight: info.logisticsPrice
          }
          let pickerData = {
            userName: info.realName,
            userPhone: info.phoneNumber,
            idCardPicOn: info.idCardPicOn,
            idCardPicOff: info.idCardPicOff
          }
          this.setData({
            formData: app.utils.copyObj(this.data.formData, formData),
            pickerData: app.utils.copyObj(this.data.pickerData, pickerData)
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
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
    switch(id) {
      case 'userName':
      case 'userPhone':
        data['pickerData.' + id] = value
        break
      default:
        data['formData.' + id] = value
    }
    this.setData(data)
  },
  // 选择门店
  changeStore: function (storeInfo) {
    if (storeInfo) {
      this.setData({
        'formData.orgId': storeInfo.orgId,
        'formData.orgName': storeInfo.shortName,
        'formData.orgLinker': storeInfo.linkMan,
        'formData.orgPhone': storeInfo.telePhone
      })
    }
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
              tempData['pickerData.' + id] = res.data.data
              this.setData(tempData)
              console.log(tempData)
              wx.hideLoading()
            }else{
              wx.showToast({
                image: '../../images/error.png',
                title: '上传失败(' + res.statusCode +')'
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

    if (this.data.pickerData.userName) {
      if (!this.data.pickerData.userPhone) {
        this.showTopTips('请输入提车人手机号')
        return
      }
      if (!this.data.pickerData.idCardPicOn) {
        this.showTopTips('请上传身份证正面照')
        return
      }
      if (!this.data.pickerData.idCardPicOff) {
        this.showTopTips('请上传身份证反面照')
        return
      }
      this.data.formData.pickers[0] = this.data.pickerData
    }

    wx.showLoading({ mask: true })
    app.json(app.config.lv2.orderAdd, this.data.formData).then(({ data }) => {
      app.storage.setItem('lv2-order-list-refresh', 1)
      app.toast('保存成功', false).then(_ => {
        if (this.data.formData.advanceOrderId) {
          app.navigateTo(`add-order?id=${data.id}&aid=${this.data.formData.advanceOrderId}`)
        }else{
          app.navigateTo('info?id=' + data.id)
        }
      })
    }).catch(err => {
      wx.hideLoading()
    })
  }
})