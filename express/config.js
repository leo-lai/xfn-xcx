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
var host = 'http://tomcat.mifengqiche.com'
// var host = 'https://tomcat.xfnauto.com'

var resURL = 'https://res.xfnauto.com'
var commonUrl = host + '/tauto/common'
var baseUrl = host + '/tauto/driver'

var config = {
  // 静态资源服务器
  resURL,
  
  // 野狗配置
  wilddog: {
    syncURL: 'https://wd5822510528sjwblr.wilddogio.com',
    authDomain: '<wd5822510528sjwblr.wilddog.com>'
  },

  // 车辆品牌
  brandList: `${commonUrl}/carsBrandList`,
  // 车系
  familyList: `${commonUrl}/carsFamilyList`,
  // 车类型(品牌，车系，年款，高低配等)
  carTypeList: `${commonUrl}/carsListList`,
  // 车身颜色
  cheshen: `${commonUrl}/carColourList`,
  // 内饰颜色
  neishi: `${commonUrl}/carInteriorList`,
  // 上传图片
  uploadFile: `${commonUrl}/uploadFile`,

  // 注册/登录 返回用户信息
  login: `${baseUrl}/login`,
  // 修改密码
  password: `${baseUrl}/changePassword`,
  // 物流单列表
  wuliuList: `${baseUrl}/distributionList`,
  // 物流单详情
  wuliuInfo: `${baseUrl}/distributionInfo`,
  // 物流单接单
  wuliuJie: `${baseUrl}/distributionOrderTaking`,
  // 物流GPS
  wuliuGPS: `${baseUrl}/logisticsDistributionGPS`,
  // 托运单详情
  tuoyunInfo: `${baseUrl}/consignmentInfo`,
  // 装车
  loadCar: `${baseUrl}/loadCar`,
  // 物流单状态
  wuliuState: `${baseUrl}/updateDistributionState`,
  
  // 下面的地址配合云端 Server 工作
  baseUrl
};

module.exports = config
