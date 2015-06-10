var config = require('./config');
var util = require('./util');
var url = require('./serverurlconfig');
var digest = require('./digest');
var defaultKeys = ['oid_partner','busi_type','notify_type','sign_type','api_version'];//获取配置中默认参数
var keys = ['oid_partner','busi_type','notify_type','sign_type','api_version','no_order','dt_order','name_user','id_no'];//必填参数,注意，sign参数是通过其他参数生成的，所以这里不需要写
var optionKeys = ['notify_url'];//可选参数
var newDefaultKeys = ['merch_id','product_id','sign_type','key'];//网加业务API,获取配置中默认参数
var newKeys = ['merch_id','product_id','sign_type','name_card','id_card','outorder_no'];//网加业务API,必填参数,注意，sign参数是通过其他参数生成的，所以这里不需要写
/**
*支付前先检测参数是否合法
*/
function checkParam(data,keys){
	for(var i = 0 , len = keys.length ; i < len ; i++){
		if(!data.hasOwnProperty(keys[i]) || !data[keys[i]]){
			return false;
		}
	}
	return true;
}
/**
*获取配置中的常量
*@param object data
*return object
*/
function defaultKeysValue(keys){
	var result = {};
	for(var i = 0 , len = keys.length ; i < len ; i++){
		if(config[keys[i]]){
			result[keys[i]] = config[keys[i]];
		}
	}
	return result;
}
/**
*检查时间格式是否正确，14位
*@param time string
*return boolean
*/
function checkTime(time){
	return time && time.length === 14
}
/**
*连连支付类
*#################
*json:{oid_partner:'',key:'',sign_type:'',busi_partner:'',notify_url:'',url_return:''}
*#################
*/
function llpayauth(json){
	var cloneConfig = util.clone(config);
	this.config = util.extend(cloneConfig,json);
}
/**
*
*@param object jsonData
*return cb 
//******************
*#################
*/
llpayauth.prototype.doAuth = function(json,type,cb){
	this.config = util.extend(this.config,json);
	//type表示是否使用连连新版的认证api.不传，用连连新版的认证接口，传false用旧版认证接口
	if(typeof type === "function"){
		cb = type;
		type = true;
	}
	if(type === false){
		this._request(url.auth_url,defaultKeysValue(keys),keys,optionKeys,json,cb);
	}else{
		this._request(url.new_auth_url,defaultKeysValue(newKeys),newKeys,[],json,cb);
	}
}

llpayauth.prototype._request = function(url,defaultKeys,keys,optionKeys,json,cb){
	var defaultValue = util.clone(defaultKeys);
	var cloneConfig = util.clone(this.config);
	json = util.extend(cloneConfig,json);
	json = util.extend(defaultValue,json);
	//检测参数是否齐全
	if(!checkParam(json,keys)){
		return cb("参数错误，请检查！");
	}
	json = util.pick(json,keys.concat(optionKeys));//拾取连连支付所支持的参数
	var obj = this._buildRequestPara(json);
	var request = require('request');
	request.post({url:url,body:JSON.stringify(obj)},function(error, response, body){
		if(!error && response.statusCode === 200){
			cb(null,JSON.parse(body));
		}else{
			cb(error, response, body);
		}	
	})
}

/**
 * 生成要请求给连连支付的参数数组
 * @param $para_temp 请求前的参数数组
 * @return 要请求的参数数组
 */
llpayauth.prototype._buildRequestPara = function(para_temp) {
	//除去待签名参数数组中的空值和签名参数
	var para_filter = util.paraFilter(para_temp);
	//对待签名参数数组排序
	var para_sort = util.sortObjectByKey(para_filter);
	//生成签名结果
	var mysign = this._buildRequestMysign(para_sort);
	//签名结果与签名方式加入请求提交参数组中
	para_sort['sign'] = mysign;
	para_sort['sign_type'] = this.config['sign_type'].toUpperCase();
	return para_sort;
}
/**
 * 生成签名结果
 * @param $para_sort 已排序要签名的数组
 * return 签名结果字符串
 */
llpayauth.prototype._buildRequestMysign = function(para_sort){
	//把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
	var prestr = util.jsonToSearch(para_sort);
	var signType = this.config['sign_type'].trim().toUpperCase();
	var mysign = "";
	switch(signType){
		case "MD5" :
			mysign = digest.md5Sign(prestr, this.config['key']);
			break;
		case "RSA" :
			mysign = digest.Rsasign(prestr, this.config['trader_pri_key'],'MD5');
			break;
		default :
			mysign = "";
	}
	return mysign;
}
/**
 * 对连连支付返回的数据进行认证
 * @param json object
 * return boolean
 */
llpayauth.prototype.verify = function(json){
	var result = util.clone(json);
	var sign = result.sign;
	var sign_type = result.sign_type;
	if(!sign){
		return false;
	}
	delete result.sign;
	var para_sort = util.sortObjectByKey(result);
	var prestr = util.jsonToSearch(para_sort);
	var signType = this.config['sign_type'].trim().toUpperCase();
	signType = sign_type || signType;
	if(signType === 'MD5'){
		return digest.md5Verify(prestr,sign,this.config.key);
	}else{
		return digest.Rsaverify(prestr,sign,this.config.yt_pub_key,'MD5');
	}
	
}
/**
 * 返回结果字段result_pay必须是SUCCESS才表示支付成功。
 * @param json object
 * return boolean
 */
llpayauth.prototype.success = function(result){
	return result.result_pay === 'SUCCESS';
}
Object.defineProperty(llpayauth, "UTIL", {
  get: function () {
    return util;
  }
});
Object.defineProperty(llpayauth, "DIGEST", {
  get: function () {
    return digest;
  }
});
module.exports = llpayauth;