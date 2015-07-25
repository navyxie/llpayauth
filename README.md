# 连连实名认证 SDK

**注意：支持连连新版和旧版的实名认证
**新商户的商户号是以W开头**

## API

`doAuth`

```js
var llpayauth = require('llpayauth');
var intiData = {
	key:"",//MD5key
	sign_type:"",//加密方式
	yt_pub_key:'',//连连公钥
	trader_pri_key:''//商户私钥
}
var llpayauthInstance = new llpayauth(intiData);//实例化
llpayauthInstance.doAuth({
	"merch_id": "2015**********2",//商户ID,连连后台查看
	"outorder_no":"123456789navytest_auth_new",//商户订单id
	"name_card":"**",//用户姓名
	"id_card":"**"//用户身份证
},function(err,data){
	if(!err){
		data => {
			"sign":"1ff4bf16dd6e5f4a919cfe8f5fa1a1b2",
			"ret_code":"0000",
			"ret_msg":"[0000] 请求成功",
			"merch_id ":"W20150508000000001",
			"product_id":"B10002",
			"sign_type":"MD5",
			"order_no ":"20150527095112",
			"outorder_no ":"12312312312",
			"order_fee":"2",
			"id_card ":"330184199090909900",
			"name_card ":"张三",
			"result":"1"//返回结果：1-认证一致，2-认证不一致，3-无结果（在公安数据库中查询不到此条数据）
		}
		console.log(data);
	}		
});
```
