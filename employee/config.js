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
var env = 'dev'  // 测试
// var env = 'prod' // 正式
let getHost = (domainName = 'api') => {
  return env === 'dev' ? `http://${domainName}.mifengqiche.com` : `https://${domainName}.xfnauto.com`
}

let hosts = [getHost('tomcat'), env === 'dev' ? getHost('api') : getHost('v2'), getHost('shop')]

let resURL = 'https://res.xfnauto.com'
let commonUrl = hosts[0] + '/tauto/common'
let baseUrl = hosts[0] + '/tauto/emInterface/employee'
let baseUrl2 = hosts[1]

let config = {
  // 商城地址
  shopURL: hosts[2],
  // 静态资源服务器
  resURL,
  avatar: resURL + '/avatar.png',
  // 基础数据
  baseData: {
    carTime: ['随车', '3个工作日内', '7个工作日内', '10个工作日内', '15个工作日内'],
    buyTime: ['3天内', '7天内'],
    buyWay: ['全款', '分期付款'],
    wuliu: ['自提', '其他', '送车'],
    orderType: ['客户订车', '门店订车'],
    // 加装精品
    carParts: ['防爆膜', '底盘漆', '地毯', '灭火器', '车头锁', '头枕', '抱枕', '香水', '导航', '全车座椅拉皮', '行车记录仪（单向）', '行车记录仪（双向）', '行车记录仪（隐藏式）', '行车记录仪（高清）', '晴雨挡', '挡泥板', '全车隔音', '倒车雷达（4探）', '倒车雷达（6探）', '倒车影像', '3M膜', '内置胎压监测'],
    // 随车资料
    incarParts: ['车辆统一发明票', '用户手册', '保养手册', '合格证', '天线', '随车地毯', '三包凭证', '点烟器', '一致证书', '工具、备胎', '主匙', '备匙', '反光衣', '首保凭证', '档位盖']
  },

  // ================================================
  // 报价单
  offerPrice: `${baseUrl2}/ucenter_v2/quotation`,
  offerInfo: `${baseUrl2}/ucenter_v2/quotationDetail`,
  // 首页------------------------------------
  index: {
    data: `${baseUrl2}/ucenter_v2/index`,
  },
  // 客户管理-----------------------------------
  customer: {
    // 客户列表
    allList: `${baseUrl2}/ucenter_v2/userlist`,
    // 客户基本详情（预约及记录信息）
    info: `${baseUrl2}/ucenter_v2/userdetail`,
    // 重点客户，新增预约客户，今日预计到店
    list: `${baseUrl2}/ucenter_v2/customers`,
    // 今日回访
    visitList: `${baseUrl2}/ucenter_v2/visit`,
    // 用户订单列表
    orderList: `${baseUrl2}/ucenter_v2/customerlist`,
    // 加装/上牌/贴膜列表
    partList: `${baseUrl2}/ucenter_v2/carsproductlist`,
  },
  // 资源管理---------------------------------------
  consumer: {
    orderEdit: `${baseUrl2}/ucenter_v2/consumer/update`,
    // 门店列表
    storeList: `${baseUrl2}/ucenter_v2/organizationlist`,
    // 新增门店
    storeAdd: `${baseUrl2}/ucenter_v2/organization/create`,
    // 编辑门店
    storeEdit: `${baseUrl2}/ucenter_v2/organization/edit`,
    // 资源订单列表
    orderList: `${baseUrl2}/ucenter_v2/consumerlist`,
    // 资源订单详情
    orderInfo: `${baseUrl2}/ucenter_v2/consumerDetail`,
    contractImage: `${baseUrl2}/publics_v2/contract`,
    // 资源单出库
    outStock: `${baseUrl2}/ucenter_v2/stockout`,
    // 资源单车架号列表 
    carFrames: `${baseUrl2}/ucenter_v2/consumer/getConsumerCars`,
    // 完善资源单车架号
    framesEdit: `${baseUrl2}/ucenter_v2/setframe`,
    // 完成资源单车架号
    framesOk: `${baseUrl2}/ucenter_v2/consumer/updateState`
  },
  // 库存管理--------------------------------
  stock: {
    // 供应商列表
    supplierList: `${baseUrl2}/ucenter_v2/supplier`,
    // 出库列表
    outList: `${baseUrl2}/ucenter_v2/stockcarlist`,
    
  },
  // 学堂---------------------------------
  school: {
    list: `${baseUrl2}/article_v2/index`,
    info: `${baseUrl2}/article_v2/detail`,
  },
  // 商城接口------------------------------
  shop: {
    // 仓库列表
    cangList: `${baseUrl}/shop/organizationWarehouseList`,
    // 在售列表
    // goodsList: `${baseUrl}/shop/orgShopGoodsCarsList`,
    goodsList: `${baseUrl2}/ucenter_v2/shop`,
    goodsEdit: `${baseUrl}/shop/shopGoodsCarsEdit`,
    goodsInfo: `${baseUrl}/shop/shopGoodsCarsInfo`,
    goodsUpOff: `${baseUrl}/shop/shopGoodsCarsShelves`,
    // 活动列表
    // activeList: `${baseUrl}/shop/orgActivityList`,
    activeList: `${baseUrl2}/ucenter_v2/shop/activity`,
    activeUpOff: `${baseUrl}/shop/activityShelves`,
    activeEdit: `${baseUrl}/shop/activityEdit`,
    // 预约单列表
    orderList: `${baseUrl}/shop/orgAdvanceOrderList`,
    orderInfo: `${baseUrl}/shop/orgAdvanceOrderInfo`,
    // 贷款审核
    loanList: `${baseUrl}/shop/applyLoanList`,
    loanAudit: `${baseUrl}/shop/applyLoanAudit`,
    // 门店审核
    storeList: `${baseUrl}/shop/shopOrgList`,
    storeAudit: `${baseUrl}/shop/shopOrgAudit`,
    // 寻车列表
    seekList: `${baseUrl}/shop/shopFindCarList`,
    seekInfo: `${baseUrl}/shop/shopFindCarInfo`,
    seekOffer: `${baseUrl}/shop/shopFindCarOffer`,
    mySeekList: `${baseUrl}/shop/myShopFindCarOfferList`,
    mySeekInfo: `${baseUrl}/shop/shopFindCarOfferInfo`,
    // 配置支付信息
    storePayInfo: `${baseUrl}/shop/allInPayConfigure`,
  },
  // auth----------------------------------
  auth: {
    // 登录接口
    login: `${baseUrl2}/login_v2/index`,
  },
  // 二级人员--------------------------------
  lv2: {
    // (门店)客户列表
    storeList: `${baseUrl}/organizationList`,
    // 新增客户
    storeAdd: `${baseUrl}/organizationEdit`,
    // 代购列表
    orderList: `${baseUrl}/consumerOrder/listOrders`,
    // 代购列表-待审核
    orderList2: `${baseUrl}/consumerOrder/auditList`,
    // 新增订购单
    orderAdd: `${baseUrl}/consumerOrder/createOrder`,
    // 更新订购单
    orderEdit: `${baseUrl}/consumerOrder/update`,
    // 删除订购单
    orderDel: `${baseUrl}/consumerOrder/delete`,
    // 订购单详情（客户，车辆，提车人）
    orderInfo: `${baseUrl}/consumerOrder/getOrderDetail`,
    // 新增订购信息(客户、车辆信息)
    orderAddOrder: `${baseUrl}/consumerOrderInfo/createOrderInfo`,
    // 新增车辆
    orderAddCar: `${baseUrl}/consumerOrderInfo/create`,
    // 更新车辆
    orderEditCar: `${baseUrl}/consumerOrderInfo/update`,
    // 删除车辆
    orderDelCar: `${baseUrl}/consumerOrderInfo/delete`,
    // 新增提车人/客户
    orderAddMen: `${baseUrl}/consumerOrderUser/create`,
    // 更新提车人/客户
    orderEditMen: `${baseUrl}/consumerOrderUser/update`,
    // 删除提车人/客户
    orderDelMen: `${baseUrl}/consumerOrderUser/delete`,
    // 更新订单状态
    orderState: `${baseUrl}/consumerOrder/updateState`,
    // 可配车架号列表
    frameList: `${baseUrl}/consumerOrderInfo/queryVin`,
    // 已配车架号列表
    carFrame: `${baseUrl}/consumerOrderCar/list`,
    // 配车
    carMatch: `${baseUrl}/consumerOrderInfo/distributeCar`,
    // 重新配车（单台车）
    carMatch2: `${baseUrl}/consumerOrderInfo/redistributeCar`,
    // 验车
    carCheck: `${baseUrl}/consumerOrderCar/uploadCheckCarPic`,
    // 换车申请
    carChange: `${baseUrl}/consumerOrderInfo/changeCarApply`,
    // 同意换车
    carChange1: `${baseUrl}/consumerOrderInfo/changeCarApprove`,
    // 不同意换车
    carChange2: `${baseUrl}/consumerOrderInfo/refuseChangeCar`,
    // 更新物流信息
    wuliu: `${baseUrl}/consumerOrder/updateLogisticsInfo`,
    // 合同信息
    contract: `${baseUrl}/consumerOrder/getContractInfo`,
    // 协商价格
    changeCarPrice: `${baseUrl}/consumerOrderInfo/changePrice`,
    // 取消订单
    orderCancel: `${baseUrl}/consumerOrder/cancel`,
    // 退款
    refund: `${baseUrl}/consumerOrder/countermand`,
  },
  // 素材分享--------------------------------
  share: {
    // 素材列表
    sucaiList: `${baseUrl}/shop/myShareMaterialList`,
    sucaiAdd: `${baseUrl}/shop/shareMaterialEdit`,
    sucaiInfo: `${baseUrl}/shop/shareMaterialInfo`,
    sucaiUpOff: `${baseUrl}/shop/shareMaterialOverShelf`,
    shareList: `${baseUrl}/shop/myShareMaterialInfoList`,
    shareAdd: `${baseUrl}/shop/shareMaterialInfoEdit`,
    shareInfo: `${baseUrl}/shop/shareMaterialInfoInfo`,
    shareLink: `${baseUrl2}/publics_v2/createImage`,
  },
  // 物流接口--------------------------------
  exp: {
    // 非专线运费配置
    freight1: `${baseUrl}/dynamicLineEdit`,
    // 非专线详情
    freight1Info: `${baseUrl}/dynamicLineInfo`,
    // 专线运费列表
    freight2List: `${baseUrl}/dedicatedLineList`,
    // 专线运费配置
    freight2: `${baseUrl}/dedicatedLineEdit`,
    // 司机列表
    driverList: `${baseUrl}/driverList`,
    // 司机选择列表
    driverSlt: `${baseUrl}/driverListList`,
    // 司机详情
    driverInfo: `${baseUrl}/driverInfo`,
    // 新增司机
    driverAdd: `${baseUrl}/driverEdit`,
    // 删除司机
    driverDel: `${baseUrl}/driverDisable`,
    // 板车列表
    drayList: `${baseUrl}/logisticsCarList`,
    // 板车选择列表
    draySlt: `${baseUrl}/logisticsCarListList`,
    // 板车新增
    drayAdd: `${baseUrl}/logisticsCarEdit`,
    // 板车启用禁用
    drayEnable: `${baseUrl}/logisticsCarIsEnable`,
    // 托运单列表
    tuoyunList: `${baseUrl}/consignmentList`,
    // 托运单详情
    tuoyunInfo: `${baseUrl}/consignmentInfo`,
    // 新增托运单
    tuoyunAdd: `${baseUrl}/consignmentEdit`,
    // 运费计算
    tuoyunCount: `${baseUrl}/expensesCount`,
    // 4s对接人
    tuoyunMen1: `${baseUrl}/leaveTheCarPersons`,
    // 提车人
    tuoyunMen2: `${baseUrl}/extractTheCarPersons`,
    // 物流单列表
    wuliuList: `${baseUrl}/distributionList`,
    // 物流单新增
    wuliuAdd: `${baseUrl}/distributionEdit`,
    // 物流单详情
    wuliuInfo: `${baseUrl}/distributionInfo`,
    // 物流单添加托运车辆
    wuliuAddCar: `${baseUrl}/distributionGoodsCarAdd`,
    // 物流派单
    wuliuPai: `${baseUrl}/distributionDelivery`,
    // 物流GPS
    wuliuGPS: `${baseUrl}/logisticsDistributionGPS`,
    // 合同信息
    contract: `${baseUrl}/consignmentContract`,
    // 收款
    wuliuMoney: `${baseUrl}/logisticsInPayPOS`,
    // 物流单状态
    wuliuState: `${baseUrl}/updateDistributionState`,
  },
  
  // 车辆品牌
  brandList: `${commonUrl}/carsBrandList`,
  // 车系
  familyList: `${commonUrl}/carsFamilyList`,
  // 车类型(品牌，车系，年款，高低配等)
  carTypeList: `${commonUrl}/carsListList`,
  // 图片文字识别
  image2text: `${commonUrl}/imageRecognition`,
  // 上传个人微信二维码
  wxQrImage: `${baseUrl}/weixinQrImage`,
  // 上传文件
  uploadFile: `${baseUrl}/uploadFile`,
  // 更改密码
  password: `${baseUrl}/changePassword`,
  // 车辆库存列表
  carStockList: `${baseUrl}/stockCarList`,
  // 在售车型列表
  carOnlineList: `${baseUrl}/orgCarsConfigureList`,
  // 在售车型详情
  carOnlineInfo: `${baseUrl}/orgCarsConfigureInfo`,
  // 新增在售
  carStockAdd: `${baseUrl}/editOrgCarsConfigure`,
  // 车辆库存详情
  carStockInfo: `${baseUrl}/stockCarInfo`,
  // 添加备注
  customerRemark: `${baseUrl}/addCustomerRemarks`,
  // 新增客户
  customerAdd: `${baseUrl}/addCustomerUsersr`,
  // 修改客户资料
  customerDetails: `${baseUrl}/changeUserInfo`,
  // 客户购车单信息
  customerOrderInfo: `${baseUrl}/customerOrderAllInfo`,
  // 客户开单前
  customerOrderBefore: `${baseUrl}/createOrderBefor`,
  // 客户开单
  customerOrderAdd: `${baseUrl}/editCustomerOrder`,
  // 客户订单列表
  customerOrderList: `${baseUrl}/myCustomerOrderList`,
  // 车身颜色列表
  cheshen: `${baseUrl}/carColourList`,
  // 内饰颜色
  neishi: `${baseUrl}/carInteriorList`,
  // 上传资料
  customerUpload: `${baseUrl}/addBankAudits`,
  // 交付车辆
  customerJiaoche: `${baseUrl}/turnOverVehicle`,
  // 待出库单列表
  stockOutList: `${baseUrl}/customerOrderList`,
  // 出库单详情
  stockOutInfo: `${baseUrl}/customerOrderInfo`,
  // 获取出库单可出库车辆
  stockOutCarList: `${baseUrl}/customerOrderStockCar`,
  // 确定出库车辆
  stockOutCar: `${baseUrl}/customerOrderStockCarPutout`,
  // 上牌完成
  licenseDone: `${baseUrl}/licensePlateDone`,
  // 贴膜完成
  tiemoDone: `${baseUrl}/carsPadPastingDone`,
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
  // 银行审核通过
  bankPass: `${baseUrl}/bankApprovalPass`,
  // 银行审核不通过，全款支付尾款
  bankNotPass: `${baseUrl}/changeFullPayment`,
  // 标记为过线检查
  overTheLine: `${baseUrl}/overTheLine`,
  // 回访备注
  orderVisit: `${baseUrl}/orderVisit`,
  // 采购员列表
  buyerList: `${baseUrl}/orgOneSelfList`,
  // 仓位列表
  cangList: `${baseUrl}/organizationWarehouseList`,
  // 入库单列表
  stockInList: `${baseUrl}/storageList`,
  // 新增入库单
  stockInAdd: `${baseUrl}/storageEdit`,
  // 入库单详情
  stockInInfo: `${baseUrl}/storageInfo`,
  // 入库单新增车辆
  stockInAddCar: `${baseUrl}/storageCarEdit`,
  // 入库单删除车辆
  stockInDelCar: `${baseUrl}/storageCarDelete`,
  // 入库单删除
  stockInDel: `${baseUrl}/storageDelete`,
  // 全部已入库
  stockInSure: `${baseUrl}/storageOverSure`,
  
  

  /*********************废弃接口 start************************/
  // 登录
  // login: `${baseUrl}/login`,
  // 搜索客户
  customerSearch: `${baseUrl}/customerPhoneSearchList`,
  // 预约客户列表
  customerBespeak: `${baseUrl}/bespeakCustomerOrgList`,
  // 订单客户列表
  customerOrder: `${baseUrl}/orderStateCustomerList`,
  // 客户列表v2 (2018-01-04)
  customerList: `${baseUrl}/customerUserList`,
  // 门店列表
  storeList: `${baseUrl}/organizationLevelList`,
  // 客户详情
  customerInfo: `${baseUrl}/customerUsersrInfo`,
  // 待贴膜列表
  // tiemoList: `${baseUrl}/carsPadPastingList`,
  // 待上牌列表
  // licenseList: `${baseUrl}/orderLicensePlateList`,
  // 精品加装列表
  // carPartList: `${baseUrl}/carsProductsList`,
  // 供应商列表
  // supplierList: `${baseUrl}/supplierListList`,

  // 三级订车--------------------------------
  // 订车单列表
  stockOrderList: `${baseUrl}/stockOrderList`,
  // 订车单详情
  stockOrderInfo: `${baseUrl}/stockOrderInfo`,
  // 取消订车单
  stockOrderCancel: `${baseUrl}/stockOrderCancel`,
  // 订车单签收
  stockOrderSign: `${baseUrl}/stockOrderSign`,
  // 新增订车单
  stockOrderAdd: `${baseUrl}/stockOrderCreate`,
  // 业绩查询
  salerReport: `${baseUrl}/querySalesPerformance`,
  /*********************废弃接口 end************************/
}

module.exports = config
