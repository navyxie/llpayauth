var llpayauth = require('../lib/llpayauth');
var config = require('../lib/config');
var should = require('should');
var muk = require('muk');
var request = require('request');
describe('#doAuth()',function(){
	
	//新版认证
	describe('should ok',function(){
		var llpayauthInstance = new llpayauth({
			key:"test",
			sign_type:"RSA",		
			yt_pub_key:config.yt_pub_key,
			trader_pri_key:config.trader_pri_key
		});
		before(function(){
			muk(request,'post',function(json, callback){
				describe('#json.url should be "https://yintong.com.cn/tradeauthapi/v1/auth/get_auth"#',function(){
					var body = JSON.parse(json.body);
					// console.log(body);
					//新版认证的地址必须是"https://yintong.com.cn/tradeauthapi/v1/auth/get_auth"
					it('url should ok',function(){
						json.url.should.be.equal("https://yintong.com.cn/tradeauthapi/v1/auth/get_auth");				
					});
					it('sign_type should ok',function(){
						body.sign_type.should.be.equal('RSA');
					});
					it('sign should ok',function(){
						body.sign.should.be.equal("I3f1474b97h7op5+YFLiv9VAphwwd8CwG+OVfpPLRQL40cHuk8qlC8GGq/kPK4R1oAViMKwC3KSSciUdA3wauBaE6zyktV8slIU2Sf69hX6hUeEyndPlVk74wwE0z3akglFEMIwFGPJfWZOGnfkh9xDbcrWMbJgnDSOCFdR/XgQ=");
					})
				});			
				var res = {
					"sign":"1ff4bf16dd6e5f4a919cfe8f5fa1a1b2",
					"ret_code":"0000",
					"ret_msg":"[0000] 请求成功",
					"merch_id":"W20150508000000001",
					"product_id":"B10002",
					"sign_type":"RSA",
					"order_no":"20150527095112",
					"outorder_no":"12312312312",
					"order_fee":"2",
					"id_card":"330184199090909900",
					"name_card":"张三",
					"result":"1"
				};
				process.nextTick(function(){
					callback(null,{statusCode:200},JSON.stringify(res));
				})
			})
		});
		after(function(){
			muk.restore();
		});
		// new version,新商户的商户号是以W开头
		it('doAuth new version should ok',function(done){
			llpayauthInstance.doAuth({
				"merch_id": "W2015",
				"outorder_no":"123456789navytest_auth_new",
				"name_card":"谢**",
				"id_card":"440****",
				sign_type:"RSA"
			},function(err,data){
				data.should.have.properties(['id_card','merch_id','name_card','order_fee','order_no','outorder_no','product_id','result','ret_code','ret_msg','sign','sign_type']);
				done(err);
			})
		})
	});
	//旧版认证
	describe('should ok',function(){
		var llpayauthInstance = new llpayauth({
			key:"test2",
			sign_type:"MD5",		
			yt_pub_key:config.yt_pub_key,
			trader_pri_key:config.trader_pri_key
		});
		before(function(){
			muk(request,'post',function(json, callback){
				var body = JSON.parse(json.body);
				describe('#json.url should be "https://yintong.com.cn/tradeauthapi/auth.htm"#',function(){
					//旧版认证的地址必须是"https://yintong.com.cn/tradeauthapi/auth.htm"
					it('should ok',function(){
						json.url.should.be.equal("https://yintong.com.cn/tradeauthapi/auth.htm");
					});
					it('sign_type should ok',function(){
						body.sign_type.should.be.equal('MD5');
					});
					it('sign should ok',function(){
						body.sign.should.be.equal("6f73b563eac8227f35f61a83caa5bf8d");
					})
				});			
				var res = {
					"sign":"1ff4bf16dd6e5f4a919cfe8f5fa1a1b2",
					"ret_code":"0000",
					"ret_msg":"[0000] 请求成功",
					"merch_id":"W20150508000000001",
					"product_id":"B10002",
					"sign_type":"MD5",
					"order_no":"20150527095112",
					"outorder_no":"12312312312",
					"order_fee":"2",
					"id_card":"330184199090909900",
					"name_card":"张三",
					"result":"1"
				};
				process.nextTick(function(){
					callback(null,{statusCode:200},JSON.stringify(res));
				})
			})
		});
		after(function(){
			muk.restore();
		});
		// old version
		it('doAuth new version should ok',function(done){
			llpayauthInstance.doAuth({
				"oid_partner": "2015",
				"no_order":"123456789navytest_auth",
				"dt_order":"20150605173032",
				"name_user":"李**",
				"id_no":"442****"
			},false,function(err,data){
				data.should.have.properties(['id_card','merch_id','name_card','order_fee','order_no','outorder_no','product_id','result','ret_code','ret_msg','sign','sign_type']);
				done(err);
			})
		})
	});
})