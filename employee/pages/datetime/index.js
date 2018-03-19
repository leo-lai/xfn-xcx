// pages/datetime/index.js
const app = getApp()
// 两位数数字
const number2 = num => {
  return num < 10 ? ('0' + num) : ('' + num)
}

let years = []
let months = []
let days = []
let hours = []
let minutes = []
let nowDate = new Date()

// 年
for (let i = nowDate.getFullYear(); i <= nowDate.getFullYear() + 10; i++) {
  years.push(i + '')
}
// 月
for (let i = 1; i <= 12; i++) {
  months.push(number2(i))
}
// 日
for (let i = 1; i <= 31; i++) {
  days.push(number2(i))
}
// 时
for (let i = 0; i <= 23; i++) {
  hours.push(number2(i))
}
// 分
for (let i = 0; i <= 59; i++) {
  minutes.push(number2(i))
}

Page({
  data: {
    years,
    months,
    days,
    hours,
    minutes,

    pickerValues: [0, 0, 0, 0, 0],
    dateTimeValus: []
  },
  onLoad: function (options) {
    let nowDate = this.options.date ? 
      app.utils.str2date(this.options.date) : new Date()

    let year = nowDate.getFullYear() + ''
    let month = number2(nowDate.getMonth() + 1)
    let day = number2(nowDate.getDate())
    let hour = number2(nowDate.getHours())
    let minute = number2(nowDate.getMinutes())

    let pickerValues = [
      years.indexOf(year),
      months.indexOf(month),
      days.indexOf(day),
      hours.indexOf(hour),
      minutes.indexOf(minute)
    ]
    this.setData({ pickerValues })
    this.setData({ dateTimeValus: [year, month, day, hour, minute] })
  },
  bindChange: function (event) {
    const val = event.detail.value
    let year = years[val[0]]
    let month = months[val[1]]
    let day = days[val[2]]
    let hour = hours[val[3]]
    let minute = minutes[val[4]]
    
    // 当前月份的总天数
    var totalDay = new Date(year * 1, month * 1, 0).getDate()

    var changeDate = []
    for (let i = 1; i <= totalDay; i++) {
      changeDate.push(number2(i))
    }
    this.setData({ days: changeDate })

    day > totalDay && (day = totalDay)
    this.setData({ dateTimeValus: [year, month, day, hour, minute] })

    console.log(year, month, day, hour, minute)
  },
  submit: function () {
    app.getPrevPage().then(prevPage => {
      prevPage.onDatetime && prevPage.onDatetime(this.data.dateTimeValus)
    })
    app.back()
  }
})  