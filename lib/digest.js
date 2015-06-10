var crypto = require("crypto");
var utf8 = require('utf8');
/**生成md5签名
 * @param string aValue
 * @param string aKey md5key
 * @return string
 */
function md5Sign(aValue,aKey){
	aValue += "&key=" + aKey;
	var hmac = crypto.createHash('md5');
	hmac.update(aValue,'utf8');
	var sign = hmac.digest('hex');
	return sign;
	// return hmac.digest('hex');
}
/**
 * 验证签名
 * @param string prestr 需要签名的字符串
 * @param string sign 签名结果
 * @param string key md5key
 * return 签名结果
 */
function md5Verify(prestr,sign,key){
	prestr += "&key=" + key;
	var hmac = crypto.createHash('md5');
	hmac.update(prestr,'utf8');
	return hmac.digest('hex') === sign;
}

/**
	获取rsa私钥的前缀
	@return string
*/
function getRSAPrivateKeyPrefix(){
	return '-----BEGIN RSA PRIVATE KEY-----\r\n';
}
/**
	获取rsa私钥的后缀
	@return string
*/
function getRSAPrivateKeySuffix(){
	return '-----END RSA PRIVATE KEY-----';
}
/**
	获取rsa公钥的前缀
	@return string
*/
function getRSAPublickKeyPrefix(){
	return '-----BEGIN PUBLIC KEY-----\r\n';
}
/**
	获取rsa公钥的后缀
	@return string
*/
function getRSAPublicKeySuffix(){
	return '-----END PUBLIC KEY-----';
}
/**
	@param string key
	格式化rsa的私钥，64位长度为一行
	@return string
*/
function formatRSAKey(key){
	var len = key.length;
	var privateLen = 64;//private key 64 length one line
	var space = Math.floor(len/privateLen);
	var flag = len%privateLen === 0 ? true : false;
	var str = "";
	for(var i = 0 ; i < space ; i++){
		str += key.substr(i*privateLen,privateLen) + '\r\n';
	}
	if(!flag){
		str += key.substring(space*privateLen) + '\r\n';
	}
	return str;
}
/**
	@param string key rsa的私钥
	返回标准格式的rsa的私钥
	@return string
*/
function getRSAPrivateKey(key){
	return getRSAPrivateKeyPrefix() + formatRSAKey(key) + getRSAPrivateKeySuffix();
}
/**
	@param string key rsa的私钥
	返回标准格式的rsa的公钥
	@return string
*/
function getRSAPublicKey(key){
	return getRSAPublickKeyPrefix() + formatRSAKey(key) + getRSAPublicKeySuffix();
}
/**RSA签名
 * data签名数据(需要先排序，然后拼接)
 * key商户私钥
 * 签名用商户私钥，必须是没有经过pkcs8转换的私钥
 * 最后的签名，需要用base64编码
 * return Sign签名
 */
 function Rsasign(valStr,merchantPrivateKey,algorithm){
	valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
	algorithm = algorithm || "RSA-SHA1";
	var RSA = crypto.createSign(algorithm);
	var pem = getRSAPrivateKey(merchantPrivateKey);
	RSA.update(valStr);	
	return RSA.sign(pem,'base64');
}
/**RSA验签
 * data待签名数据(需要先排序，然后拼接)
 * sign需要验签的签名,需要base64_decode解码
 * key银通公钥 
 * 验签用连连支付公钥
 * return 验签是否通过 bool值
 */
function Rsaverify(valStr,sign,yitongPublickKey,algorithm) {
	valStr = utf8.encode(valStr);//中文字符使用UTF-8编码,see:http://mobiletest.yeepay.com/file/doc/pubshow?doc_id=19#hm_6, keyword:RSA验签
	algorithm = algorithm || "RSA-SHA1";
	var verifier = crypto.createVerify(algorithm);
	verifier.update(valStr);
	return verifier.verify(getRSAPublicKey(yitongPublickKey),sign,"base64");
}
module.exports = {
	md5Sign:md5Sign,
	md5Verify:md5Verify,
	Rsasign:Rsasign,
	Rsaverify:Rsaverify
}