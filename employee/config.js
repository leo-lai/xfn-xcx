/**
 *                    _ooOoo_
 *                   o8888888o
 *                   88" . "88
 *                   (| -_- |)
 *                    O\ = /O
 *                ____/`---'\____
 *              .   ' \\| |// `.
 *               / \\||| : |||// \
 *             / _||||| -:- |||||- \
 *               | | \\\ - /// | |
 *             | \_| ''\---/'' | |
 *              \ .-\__ `-` ___/-. /
 *           ___`. .' /--.--\ `. . __
 *        ."" '< `.___\_<|>_/___.' >'"".
 *       | | : `- \`.;`\ _ /`;.`/ - ` : | |
 *         \ \ `-. \_ __\ /__ _/ .-` / /
 * ======`-.____`-.___\_____/___.-`____.-'======
 *                    `=---='
 *
 * .............................................
 *                佛祖坐镇 顺利上线
 */

// var baseUrl = "http://111.230.170.36/tauto/emInterface/employee"
var baseUrl = "https://tomcat.xfnauto.com/tauto/emInterface/employee"
var resURL = 'http://res.mifengqiche.com'
var config = {
  baseData: {
    buyTime: ['3天内', '7天内'],
    buyWay: ['全款', '分期'],
    orderType: ['客户订车', '门店订车']
  },
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
  // 车系
  familyList: `${baseUrl}/carsFamilyList`,
  // 车类型(品牌，车系，年款，高低配等)
  carTypeList: `${baseUrl}/carsListList`,
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
  // 新增客户
  customerAdd: `${baseUrl}/addCustomerUsersr`,
  // 上传资料
  customerUpload: `${baseUrl}/addBankAudits`,
  // 待出库单列表
  stockOutList: `${baseUrl}/customerOrderList`,
  // 出库单详情
  stockOutInfo: `${baseUrl}/customerOrderInfo`,
  // 获取出库单可出库车辆
  stockOutCarList: `${baseUrl}/customerOrderStockCar`,
  // 确定出库车辆
  stockOutCar: `${baseUrl}/customerOrderStockCarPutout`,
  // 待上牌列表
  licenseList: `${baseUrl}/orderLicensePlateList`,
  // 上牌完成
  licenseDone: `${baseUrl}/licensePlateDone`,
  // 精品加装
  carPartList: `${baseUrl}/carsProductsList`,
  // 销售顾问列表
  salesList: `${baseUrl}/salesList`,
  // 分配销售顾问
  changeSales: `${baseUrl}/systenUserChangeCustomerOrg`,
  // 精品完成时间
  estimateDate: `${baseUrl}/addCarsProductsEstimateDate`,
  // 精品详情
  carPartInfo: `${baseUrl}/carsProductsInfo`,
  // 加装完成
  carPartDone: `${baseUrl}/carsProductsDone`,
  
  baseUrl
};

module.exports = config
