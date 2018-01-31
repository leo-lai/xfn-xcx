// es6 es7 polyfill ************************************************************
if (!Promise.prototype.done) {
  Promise.prototype.done = function (onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected)
      .catch(reason => setTimeout(() => { throw reason }, 0))
  }
}

if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    let P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    )
  }
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}
/** 
 *  对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
    可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
    Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
 */
if (!Date.prototype.format) {
  Date.prototype.format = function (fmt = 'yyyy-MM-dd HH:mm') {
    var o = {
      'M+': this.getMonth() + 1, //月份         
      'd+': this.getDate(), //日         
      'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
      'H+': this.getHours(), //小时         
      'm+': this.getMinutes(), //分         
      's+': this.getSeconds(), //秒         
      'q+': Math.floor((this.getMonth() + 3) / 3), //季度         
      'S': this.getMilliseconds() //毫秒         
    }
    var week = {
      '0': '/u65e5',
      '1': '/u4e00',
      '2': '/u4e8c',
      '3': '/u4e09',
      '4': '/u56db',
      '5': '/u4e94',
      '6': '/u516d'
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    if (/(E+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + ''])
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return fmt
  }
}

// 货币格式 100000.11 -> 100,000.11
if (!Number.prototype.currency){
  Number.prototype.currency = function (places, symbol = '', thousand = ',', decimal = '.') {
    places = !isNaN(places = Math.abs(places)) ? places : 2
    var number = this,
      negative = number < 0 ? '-' : '',
      i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '',
      j = (j = i.length) > 3 ? j % 3 : 0
    return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '')
  }
}

// utils ***********************************************************************
// dateStr  "yyyy-MM-dd hh:mm:ss" 转成Date对象
const str2date = (dateStr = '') => {
  return dateStr ? new Date(Date.parse(dateStr.replace(/-/gi, '/'))) : new Date()
}

// JS转换时间戳为“刚刚”、“1分钟前”、“2小时前”
// dateStr  "yyyy-MM-dd hh:mm:ss"
const formatTime2chs = (dateStr = '', fmt) => {

  if (!dateStr) return ''

  // 将时间字符串转化成毫秒ms
  let date = str2date(dateStr)
  let dateMs = date.getTime()
  let nowDate = new Date()
  
  let diffMs = nowDate.getTime() - dateMs
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let halfamonth = day * 15
  let month = day * 30
  let monthC = diffMs / month
  let weekC = diffMs / (7 * day)
  let dayC = diffMs / day
  let hourC = diffMs / hour
  let minC = diffMs / minute

  if (fmt) {
    if (dayC > 2) {
      return date.format('yyyy年M月d日 HH:mm')
    } else {
      let diffDay = nowDate.getDate() - date.getDate()
      if (diffDay === 0) {
        return date.format('HH:mm')
      } else {
        return '昨天 ' + date.format('HH:mm')
      }
    }
  }

  const week = {
    '0': '/u65e5',
    '1': '/u4e00',
    '2': '/u4e8c',
    '3': '/u4e09',
    '4': '/u56db',
    '5': '/u4e94',
    '6': '/u516d'
  }

  let result = ''
  if (monthC >= 1) { // 大于一个月则显示日期
    result = date.format('yyyy年M月d')
  }
  else if (weekC > 1) {
    result = parseInt(weekC) + '周前'
  }
  else if (weekC == 1) { // 星期几
    result = '/u661f/u671f' + week[date.getDay()] + ' ' + date.format('HH:mm')
  }
  else if (dayC >= 2) { // 大于48小时
    result = parseInt(dayC) + '天前'
  }
  else if (hourC >= 1) {
    result = parseInt(hourC) + '小时前'
  }
  else if (minC >= 1) {
    result = parseInt(minC) + '分钟前'
  }
  else {
    result = '刚刚'
  }

  return result
}

// 两位数数字
const number2 = num => {
  return num < 10 ? ('0' + num) : ('' + num)
}

// 倒计时 endDate "yyyy-MM-dd hh:mm:ss"
const timer = endDate => {
  //计算剩余的毫秒数
  var leftMS = str2date(endDate) - new Date()
  //计算剩余的天数
  var days = parseInt(leftMS / 1000 / 60 / 60 / 24, 10)
  //计算剩余的小时
  var hours = parseInt(leftMS / 1000 / 60 / 60 % 24, 10)
  //计算剩余的分钟
  var minutes = parseInt(leftMS / 1000 / 60 % 60, 10)
  //计算剩余的秒数
  var seconds = parseInt(leftMS / 1000 % 60, 10)

  hours = number2(hours)
  minutes = number2(minutes)
  seconds = number2(seconds)
  
  return [days, hours, minutes, seconds]
}

const isObject = (target) => {
  return Object.prototype.toString.call(target).toLocaleLowerCase() === '[object object]'
}

// 复制对象
const copyObj = (target = {}, ...objs) => {
  objs.forEach((obj) => {
    if (isObject(obj)) {
      Object.keys(target).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined) {
          target[key] = obj[key]
        }
      })
    } else {
      Object.keys(target).forEach(key => {
        target[key] = ''
      })
    }
  })
  return target
}

// 微信头像
const formatHead = (src, size = 132) => {
  if (!src) {
    return `https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=%E5%9B%BE%E7%89%87%E7%BC%BA%E5%A4%B1&w=${size}&h=${size}`
  }
  if (src.indexOf('wx.qlogo.cn') === -1) {
    return src
  }
  // 有0、46、64、96、132数值可选，0代表640*640正方形头像
  return src.replace(/\/0$/, '/' + size)
}

// 七牛缩略图
const formatThumb = (src = '', height, width = 375, type = 'webp') => {
  if (!src) {
    // return `https://placeholdit.imgix.net/~text?txtsize=20&bg=ffffff&txtclr=999&txt=image&w=${width}&h=${width}` 
    return ''
  }
  if (src.indexOf('clouddn.com') === -1) {
    return src
  }

  // return src += '?imageMogr2/auto-orient/gravity/Center/crop/'+width+'x'+height;
  // src += `?imageMogr2/auto-orient/format/webp/interlace/1/quality/60/gravity/Center/thumbnail/${width}x`
  src += `?imageMogr2/auto-orient/interlace/1/thumbnail/${width}x`
  if (height) {
    src += `/gravity/Center/crop/x${height}`
  }
  return src
}

// 路径参数
const getArgs = (url) => {
  if (typeof url !== 'string') return url
  url = decodeURIComponent(url)
  let pos = url.indexOf('?'),
    pos2 = url.lastIndexOf('#'),
    qs = pos > -1 ? url.substring(pos + 1, pos2 <= pos ? url.length : pos2) : '',
    items = qs.split('&')
  let args = {},
    arg = null,
    name = null,
    value = null
  for (let i = 0, splitPos = 0, item = null; i < items.length; i++) {
    item = items[i]
    splitPos = item.indexOf('=')
    name = item.substring(0, splitPos)
    value = item.substring(splitPos + 1)
    name && (args[name] = value)
  }

  if (pos2 !== -1) {
    args['_hash'] = url.substring(pos2 + 1, url.length)
  }

  return args
}
const setArgs = (url, name, value) => {
  if (typeof url !== 'string') return ''
  if (name === undefined) return url

  let urlArgs = getArgs(url)
  let params = []

  if (typeof name === 'object') {
    Object.assign(urlArgs, name)
  } else if (typeof name === 'string') {
    urlArgs[name] = value
  }

  let hash = ''
  for (let key of Object.keys(urlArgs)) {
    let val = urlArgs[key]
    if (val != undefined) {
      if (key === '_hash') {
        hash = val
      } else {
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(val))
      }
    }
  }

  params.length > 0 && (url = url.split('?')[0] + '?' + params.join('&'))
  hash && (url += '#' + hash)

  return url
}

const guid = function () {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

module.exports = {
  guid,
  timer,
  getArgs,
  setArgs,
  isObject,
  copyObj,
  str2date,
  formatTime2chs,
  formatHead,
  formatThumb
}
