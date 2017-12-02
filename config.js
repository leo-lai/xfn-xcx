/**
 * 小程序全局配置文件
 */

var baseUrl = "http://111.230.170.36/tauto/interface/weixinapp"

var config = {

  // 野狗配置
  wilddog: {
    syncURL: 'https://wd5822510528sjwblr.wilddogio.com',
    authDomain: '<wd5822510528sjwblr.wilddog.com>'
  },

  // 注册/登录 返回用户信息
  login: `${baseUrl}/login`,
  // 获取用户信息
  userInfo: `${baseUrl}/refreshMyInfo`,
  // 车辆列表
  carList: `${baseUrl}/carList`,

  // 下面的地址配合云端 Server 工作
  baseUrl
};

module.exports = config
