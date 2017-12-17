/**
 * 小程序全局配置文件
 */

var baseUrl = "http://111.230.170.36/tauto/emInterface/employee"
var resURL = 'http://res.mifengqiche.com'
var config = {
  // 静态资源服务器
  resURL,
  avatar: resURL + '/avatar.png',

  // 野狗配置
  wilddog: {
    syncURL: 'https://wd5822510528sjwblr.wilddogio.com',
    authDomain: '<wd5822510528sjwblr.wilddog.com>'
  },

  uploadFile: `${baseUrl}/uploadFile`,
  // 注册/登录
  login: `${baseUrl}/login`,
  // 更改密码
  password: `${baseUrl}/changePassword`,
  // 车辆品牌
  brandList: `${baseUrl}/carsBrandList`,
  // 车辆库存列表
  carStockList: `${baseUrl}/stockCarList`,
  // 车辆库存详情
  carStockInfo: `${baseUrl}/stockCarInfo`,
  // 搜索客户
  customerSearch: `${baseUrl}/customerPhoneSearchList`,
  // 预约客户列表
  customerBespeak: `${baseUrl}/bespeakCustomerOrgList`,
  // 订单客户列表
  customerOrder: `${baseUrl}/orderStateCustomerList`,
  // 门店列表
  storeList: `${baseUrl}/organizationLevelList`,
  // 客户详情
  customerInfo: `${baseUrl}/customerUsersrInfo`,
  // 添加备注
  customerRemark: `${baseUrl}/addCustomerRemarks`,
  // 上传资料
  customerUpload: `${baseUrl}/addBankAudits`,
  
  baseUrl
};

module.exports = config
