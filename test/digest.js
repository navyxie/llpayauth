var digest = require('../lib/digest');
var util = require('../lib/util');
var should = require('should');
describe('#digest',function(){
	it('#md5Sign()',function(){
		var sign = "73ae43a4eaf8fb87686821d4b9e7905f";
		var key = '201307032000003506';
		var testData = {
			acct_name:"谢**",
			app_request:"3",
			busi_partner:"101001",
			card_no:"6227***********",
			dt_order:"20150428163735",
			id_no:"440882************",
			id_type:"0",
			info_order:"考拉理财,开启懒人理财生活。",
			money_order:"0.01",
			name_goods:"考拉理财",
			no_order:"5518d825d5cdc86106eeeee",
			oid_partner:"201408071000001546",
			risk_item:{"frms_ware_category":"2009","user_info_mercht_userno":"54cef05579337f164b365050","user_info_dt_register":"20150428094501","user_info_full_name":"谢**","user_info_id_no":"440882************","user_info_identify_type":"1","user_info_identify_state":"1"},
			sign_type:"MD5",
			user_id:"54cef05579337f164b365050",
			valid_order:"10080",
			version:"1.2"
		}
		var para_filter = util.paraFilter(testData);
		//对待签名参数数组排序
		var para_sort = util.sortObjectByKey(para_filter);
		var prestr = util.jsonToSearch(para_sort);
		digest.md5Sign(prestr,key).should.equal(sign);
	});
	it('#md5Verify()',function(){
		var key = '201307032000003506';
		var notifyData = {
			"oid_partner":"201103171000000000",
			"dt_order":"20130515094013",
			"no_order":"2013051500001",
			"oid_paybill":"2013051613121201",
			"money_order":"210.97",
			"result_pay":"SUCCESS",
			"settle_date":"20130516", "info_order":"用户13958069593购买了3桶羽毛球",
			"pay_type":"2",
			"bank_code":"01020000",
			"sign_type":"MD5", 
			"sign":"b807649b6a45ef6335aa3fb44930edfb"
			// "sign_type":"RSA", 
			// "sign":"ZPZULntRpJwFmGNIVKwjLEF2Tze7bqs60rxQ22CqT5J1UlvGo575QK9z/ +p+7E9cOoRoWzqR6xHZ6WVv3dloyGKDR0btvrdqPgUAoeaX/YOWzTh00vwcQ+HBtX E+vPTfAqjCTxiiSJEOY7ATCF1q7iP3sfQxhS0nDUug1LP3OLk="
		}
		var sign = notifyData.sign;
		var para_filter = util.paraFilter(notifyData);
		//对待签名参数数组排序
		var para_sort = util.sortObjectByKey(para_filter);
		var prestr = util.jsonToSearch(para_sort);
		digest.md5Verify(prestr,sign,key).should.be.ok;
	});
});