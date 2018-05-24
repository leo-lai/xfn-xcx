// pages/offer/insurance.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    guige: {
      index: 0,
      list: [
        { label: '家用6座以下', value: 950 },
        { label: '家用6座以上', value: 1100 },
      ]
    },
    zhekou: {
      index: 0,
      list: [
        { label: '无折扣', value: 1 },
        { label: '9.5折', value: 0.95 },
      ]
    },
    bareCarPrice: '0.00',   // 裸车价
    price1: '0.00',         // 原价
    price2: '0.00',         // 折扣价
    insurance: '0.00',      // 商业险
    insuranceList: [
      { 
        name: '第三者责任险', value: '', checked: true, 
        picker: {
          index: 2,
          list: [
            { label: '5万', value: 516 },
            { label: '10万', value: 746 },
            { label: '20万', value: 924 },
            { label: '50万', value: 1252 },
            { label: '100万', value: 1630 }
          ]
        }
      },
      { name: '车辆损失险', value: '', checked: true },
      { name: '全车盗抢险', value: '', checked: true },
      { 
        name: '玻璃单独破碎险', value: '', checked: true,
        picker: {
          index: 0,
          list: [
            { label: '国产', value: 0.19/100 },
            { label: '进口', value: 0.31/100 }
          ]
        }
      },
      { name: '自燃损失险', value: '', checked: true },
      { name: '不计免赔特约险', value: '', checked: true },
      { name: '无过责任险', value: '', checked: true },
      { name: '车上人员责任险', value: '', checked: true },
      { 
        name: '车身划痕险', value: '', checked: true,
        picker: {
          index: 0,
          list: [
            { label: '2000', value: 400 },
            { label: '5000', value: 570 },
            { label: '1万', value: 570 },
            { label: '2万', value: 1140 },
          ]
        }
      }
    ]
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let bareCarPrice = this.options.price || 0
    let insuranceList = this.data.insuranceList

    insuranceList[0].value = insuranceList[0].picker.list[insuranceList[0].picker.index].value
    insuranceList[1].value = Math.ceil(458.76 + bareCarPrice * 1.088 / 100)
    insuranceList[2].value = Math.ceil(101.88 + bareCarPrice * 0.0045)

    // 玻璃单独破碎险
    insuranceList[3].picker.list = insuranceList[3].picker.list.map(item => {
      item.value = Math.ceil(bareCarPrice * item.value)
      return item
    })
    insuranceList[3].value = insuranceList[3].picker.list[insuranceList[3].picker.index].value

    insuranceList[4].value = Math.ceil(101.88 + bareCarPrice * 0.15 / 100)
    insuranceList[5].value = Math.ceil((insuranceList[0].value + insuranceList[1].value) * 20 / 100)
    insuranceList[6].value = Math.ceil(insuranceList[0].value * 20 / 100)
    insuranceList[7].value = 5 * 50
    insuranceList[8].value = insuranceList[8].picker.list[insuranceList[8].picker.index].value

    this.setData({
      bareCarPrice,
      insuranceList
    })

    setTimeout(this.getTotal, 50)
  },

  // 表单输入
  bindInput: function (event) {
    let data = {}
    let id = event.target.id
    let picker = event.target.dataset.picker
    let value = event.detail.value

    if(event.type == 'input') {
      let insuranceList = this.data.insuranceList
      insuranceList[id].value = value
      data['insuranceList'] = insuranceList
    } else if (event.type == 'change' && picker) {
      value = Number(value)
      data[picker + '.index'] = value
      value = this.data[picker].list[value]
      if (app.utils.isObject(value)) {
        value = value.value
      }
    }

    this.setData(data)
    setTimeout(this.getTotal, 50)
  },

  bindPicker: function (event) {
    let insuranceList = this.data.insuranceList
    let index = event.target.dataset.picker
    let value = event.detail.value

    insuranceList[index].picker.index = event.detail.value
    insuranceList[index].value = insuranceList[index].picker.list[event.detail.value].value

    this.setData({ insuranceList })
    setTimeout(this.getTotal, 50)
  },
  
  // 选择
  toggleCheck: function (event) {
    let index = event.currentTarget.dataset.index
    let insuranceList = this.data.insuranceList

    insuranceList[index].checked = !insuranceList[index].checked
    this.setData({ insuranceList })

    setTimeout(this.getTotal, 50)
  },

  getTotal: function () {
    let price1 = 0    // 保险总价
    let price2 = 0    // 保险折扣价
    let insurance = 0 // 商业险总价
    let insuranceList = this.data.insuranceList
    
    insuranceList.forEach(item => {
      if(item.checked) {
        insurance += Number(item.value)
      }
    })

    // 商业险总价 + 交强险
    // price1 = insurance + this.data.guige.list[this.data.guige.index].value
    price1 = insurance
    price2 = price1 * this.data.zhekou.list[this.data.zhekou.index].value

    this.setData({
      price1,
      price2: Math.ceil(price2),
      insurance
    })
  },
  submit: function () {
    app.getPrevPage().then(prevPage => {
      prevPage.onInsuranceCb && prevPage.onInsuranceCb(this.data.price2)
      app.back()
    })
  }
})