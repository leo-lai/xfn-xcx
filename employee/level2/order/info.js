// level2/order/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wuliu: app.config.baseData.wuliu,
    orderType: ['常规单', '炒车单'],
    info: null
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.onLogin(userInfo => {
      this.setData({
        userInfo,
        'auditor': userInfo.roleName.indexOf('资源主管') !== -1,
      })
      this.getInfo()
    }, this.route)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.checkLogin()
  },

  // 订购单详情
  getInfo: function () {
    wx.showLoading()
    app.post(app.config.lv2.orderInfo, { 
      orderId: this.options.id 
    }).then(({ data }) => {
      // 客户信息
      data.customers.forEach(customer => {
        customer.infos.forEach(cars => {
          cars.changePrice2 = Math.abs(cars.changePrice)
          cars.auditNum = 0 // 待审核车辆
          cars.cars && cars.cars.forEach(frame => {
            frame.isTicket = !!(frame.ticketPic || frame.certificationPic || frame.tciPic || frame.ciPic || frame.expressPic || frame.otherPic)
            if (frame.auditState == 5) {
              cars.auditNum += 1
            }
          })
        })
      })

      // 支付信息
      let pay1Image = [], pay2Image = []
      data.orderPaymentVOs.forEach(pay => {
        if (pay.voucher) {
          if (pay.type == 1) {
            pay1Image = pay1Image.concat(pay.voucher.split(','))
          } else if(pay.type == 2) {
            pay2Image = pay2Image.concat(pay.voucher.split(','))
          }
        }
      })

      data.pay1Image = pay1Image
      data.pay2Image = pay2Image

      data.showEdit = !data.countermandApply && data.state != 37 && data.state != 50

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
      orderType: '',
      logisticsType: '',
      freight: '',
      pickCarDate: '',
      pickCarAddr: ''
    }, this.data.info)

    app.storage.setItem('lv2-order-info-base', formData)
    app.navigateTo('info-edit')
  },
  // 预览图片
  previewImage: function (event) {
    let urls = event.currentTarget.dataset.urls
    let current = event.target.id
    wx.previewImage({ current, urls })
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
        item.checked = item.id == id
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
          app.post(app.config.lv2.orderDelMen, {
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
  },
  // 编辑车辆
  carEdit: function (event) {
    let url = event.currentTarget.dataset.url
    let item = event.currentTarget.dataset.item
    let formData = app.utils.copyObj({
      id: '',
      familyId: '',
      carsId: '',
      carsName: '',
      guidePrice: '',
      colorId: '',
      colorName: '',
      interiorId: '',
      interiorName: '',
      carNum: '',
      depositPrice: '',
      finalPrice: '',
      isDiscount: item.changePrice < 0 ? 1 : 0,
      changePrice: '',
      remark: '',
      nakedPrice: '', // 裸车价
      trafficCompulsoryInsurancePrice: '', //交强险
      commercialInsurancePrice: '' // 商业险
    }, item)

    formData.changePrice = Math.abs(item.changePrice)
    formData.state = this.data.info.state
    app.storage.setItem('lv2-order-car', formData)
    app.navigateTo(url)
  },
  // 删除车辆
  carDel: function (event) {
    let ids = event.currentTarget.dataset.ids
    wx.showModal({
      content: '是否确定删除车辆？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true })
          app.post(app.config.lv2.orderDelCar, {
            orderId: ids[0],
            customerId: ids[1],
            id: ids[2],
            isDel: 1
          }).then(({ data }) => {
            app.toast('删除成功', false).then(_ => {
              app.storage.removeItem('lv2-order-list-refresh', 1)
              this.getInfo()
            })
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  // 配车/验车
  carMatch: function (event) {
    let carItem = event.currentTarget.dataset.item
    let item = this.data.info
    carItem.orderState = item.state
    app.storage.setItem('lv2-order-car-info', carItem)
    app.navigateTo('car-match?edit=' + (item.showEdit ? 1 : 0))
  },
  // 编辑物流信息
  editWuliu: function () {
    let formData = app.utils.copyObj({
      orderId: this.data.info.id,
      logisticsOrderCode: '',
      logisticsCompany: '',
      logisticsPlateNumber: '',
      logisticsDriver: '',
      logisticsDriverPhone: ''
    }, this.data.info)

    app.storage.setItem('lv2-order-wuliu', formData)
    app.navigateTo('wuliu')
  },
  // 票证
  showTicket: function (event) {
    let item = event.currentTarget.dataset.item
    app.storage.setItem('lv2-order-ticket', item)
    app.navigateTo('ticket')
  }
})