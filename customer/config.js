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
var host = 'http://111.230.170.36'
var host = 'https://tomcat.xfnauto.com'

var resURL = 'https://res.xfnauto.com'
var commonUrl = host + '/tauto/common'
var baseUrl = host + '/tauto/interface'

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

  // 注册/登录 返回用户信息
  login: `${baseUrl}/weixinapp/login`,
  // 获取用户信息
  userInfo: `${baseUrl}/weixinapp/refreshMyInfo`,
  // 车辆列表
  carList: `${baseUrl}/cars/carsList`,
  // 根据车系ID获取车辆列表
  carListByFid: `${baseUrl}/cars/carsFamilyList`,
  // 车辆详情
  carInfo: `${baseUrl}/cars/carsInfo`,
  // 车辆介绍
  carIntroduce: `${baseUrl}/cars/carIntroduce`,
  // 参数配置
  carParameter: `${baseUrl}/cars/carParameter`,
  // 车辆问题
  problemList: `${baseUrl}/cars/carProblemList`,
  // 全款购车
  fullPayment: `${baseUrl}/cars/fullPayment`,
  // 贷款购车
  loanPayment: `${baseUrl}/cars/loanPayment`,
  // 预约前置
  bespeakBefor: `${baseUrl}/weixinapp/bespeakBefor`,
  // 预约
  bespeak: `${baseUrl}/weixinapp/bespeak`,
  // 订单详情
  orderInfo: `${baseUrl}/order/orderInfo`,
  // 订单跟踪
  orderTrack: `${baseUrl}/order/orderTrack`,
  // 手机验证码
  phoneCode: `${baseUrl}/weixinapp/phoneVerifyCode`,
  // 用户绑定
  bindPhone: `${baseUrl}/weixinapp/phonebinding`,

  // 活动推广
  storeList: `${baseUrl}/generalize/organizationList`,
  // 已预约列表
  askedList: `${baseUrl}/generalize/generalizeInfo`,
  // 预约接口
  bespeak2: `${baseUrl}/generalize/bespeak`,

  // 下面的地址配合云端 Server 工作
  baseUrl
};

module.exports = config
