// pages/region/index.js
import regionData from '../../script/region.data.js'
const app = getApp()
Page({
  noopFn: app.noopFn,
  /**
   * 页面的初始数据
   */
  data: {
    province: {
      visible: true,
      loading: false,
      slted: {},
      list: regionData
    },
    city: {
      visible: false,
      loading: false,
      slted: {},
      list: []
    },
    area: {
      visible: false,
      loading: false,
      slted: {},
      list: []
    }
  },
  sltProvince: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      'province.slted': item,
      'city.list': item.children,
      'city.visible': true
    })
  },
  closeCity: function () {
    this.setData({ 'city.visible': false })
  },
  sltCity: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({
      'city.slted': item,
      'area.list': item.children,
      'area.visible': true
    })
  },
  sltArea: function (event) {
    let item = event.currentTarget.dataset.item
    this.setData({ 'area.slted': item })
    app.getPrevPage().then(prevPage => {
      if (prevPage.onRegion) {
        prevPage.onRegion({
          text: item.text,
          value: item.value
        }, {
          text: this.data.city.slted.text,
          value: this.data.city.slted.value
        }, {
          text: this.data.province.slted.text,
          value: this.data.province.slted.value
        })
      }
      app.back()
    })
  },
  closeArea: function () {
    this.setData({ 'area.visible': false })
  }
})