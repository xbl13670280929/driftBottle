var fs = require("fs");
//操作用户数据模型
var userModel = {};

//读取 userList.json并返回
var readUser = function() {
	return JSON.parse(fs.readFileSync("./data/userList.json").toString());
};
//设置 userList.json
var writeUser = function(obj) {
	fs.writeFileSync("./data/userList.json", JSON.stringify(obj));
	return true;
};

/*
 *用途:添加用户
 *参数:options.username 用户的username
 *参数:options.password 用户的password
 *参数:callback 操作完成之后的回调
 *回调参数:callback(data)
 *用例:userModel.addUser({username: "xbl01", password: "aaaaa888"}, function(data) {});
**/
userModel.addUser = function(options, callback) {
	var resData = {};
	var listObj = readUser();
	var lastId = parseInt(listObj[listObj.length-1].userId, 10) + 1;

	//判断是否已被注册
	var regiFlag = false;
	var regiUsername = options.username;
	for(var i = 0; i < listObj.length; i++) {
		if(regiUsername === listObj[i].username) {
			regiFlag = true;
			break;
		}
	}

	if(regiFlag) {//已被注册
		resData.rtnCode = "111";
		resData.rtnMsg = "该帐户已被注册";
	}else {//可以注册
		//添加注册
		var userObj = {
			userId: lastId,
			username: options.username,
			password: options.password,
			nickName: options.nickName || options.username
		};
		listObj.push(userObj);
		writeUser(listObj);
		resData.rtnCode = "000";
		resData.rtnMsg = "success";
	}
	
	callback && callback.call(this, resData);
	return this;
};

/*
 *用途:获取用户详情信息
 *参数:userId 用户的userId
 *参数:callback 操作完成之后的回调
 *回调参数:callback(data)
 *用例:userModel.addUser(1, function(data) {});
**/
userModel.getUserDetail = function(userId, callback) {
	var resData = {};
	var listObj = readUser();

	for(var i = 0; i < listObj.length; i++) {
		if(userId === listObj[i].userId) {
			resData.data = listObj[i];
			break;
		}
	}

	resData.rtnCode = "000";
	resData.rtnMsg = "success";

	callback && callback.call(this, resData);
	return this;
};

/*
 *用途:登录匹配
 *参数:options.username 用户的username
 *参数:options.password 用户的password
 *参数:callback 操作完成之后的回调
 *回调参数:callback(data)
 *函数注意点:若匹配成功,响应值应包括用户userId,以用于维持登录态
 *用例:userModel.login({username: "xbl01", password: "aaaaa888"
}, function(data) {})
**/
userModel.login = function(options, callback) {
	var resData = {};
	var listObj = readUser();
	var flag = false;
	var userId;

	for(var i = 0; i < listObj.length; i++) {
		if(options.username === listObj[i].username && options.password === listObj[i].password) {
			flag = true;
			userId = listObj[i].userId;
			break;
		}
	}

	if(flag) {
		resData.rtnCode = "000";
		resData.rtnMsg = "success";
		resData.userId = userId;
	}else {
		resData.rtnCode = "111";
		resData.rtnMsg = "用户密码不匹配";
	}

	callback && callback.call(this, resData);
	return this;
};

module.exports = userModel;