/**
 * 小程序全局配置文件
 */

var baseUrl = "http://111.230.170.36/tauto/interface"

var config = {
  // 静态资源服务器
  resURL: 'http://res.mifengqiche.com',
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
  carList: `${baseUrl}/cars/carsList`,
  // 车辆列表
  carListByFid: `${baseUrl}/cars/carsFamilyList`,
  // 车辆品牌
  brandList: `${baseUrl}/cars/carsBrandList`,
  // 车辆详情
  carInfo: `${baseUrl}/cars/carsInfo`,
  // 车辆介绍
  carIntroduce: `${baseUrl}/cars/carIntroduce`,
  // 参数配置
  carParameter: `${baseUrl}/cars/carParameter`,
  // 车辆问题
  problemList: `${baseUrl}/cars/carProblemList`,

  // 下面的地址配合云端 Server 工作
  baseUrl
};

module.exports = config
