var fs = require("fs");
var userModel = require("../sql/user");
//数据模型
var bottleModel = {};

//读取 botList.json并返回
var readBotList = function() {
	return JSON.parse(fs.readFileSync("./data/botList.json").toString());
};
//设置 botList.json
var writeBotList = function(obj) {
	fs.writeFileSync("./data/botList.json", JSON.stringify(obj));
	return true;
};
//读取 botMsgList.json并返回
var readBotMsgList = function() {
	return JSON.parse(fs.readFileSync("./data/botMsgList.json").toString());
};
//设置 botMsgList.json
var writeBotMsgList = function(obj) {
	fs.writeFileSync("./data/botMsgList.json", JSON.stringify(obj));
	return true;
};

//将毫秒转成2017-05-25 00:00:00的值
var timeFormat = function(val) {
	var date = new Date(val);
	var result = "";
	result += date.getFullYear() + "-";
	result += ("00" + (date.getMonth() + 1)).slice(-2) + "-";
	result += ("00" + date.getDate()).slice(-2) + " ";
	result += ("00" + date.getHours()).slice(-2) + ":";
	result += ("00" + date.getMinutes()).slice(-2) + ":";
	result += ("00" + date.getSeconds()).slice(-2);
	return result;
};

/*
 *用途:获取:我的瓶子--收到的瓶子列表
 *参数:userId 用户自己的userId
 *参数:callback 操作完成后的回调
 *回调参数:callback(data)
 *用例:bottleModel.getReceivedBotList(1, function(data) {});
**/
bottleModel.getReceivedBotList = function(userId, callback) {
	var resData = {};
	var listObj = readBotList();
	var ret = [];

	for(var i = 0; i < listObj.length; i++) {
		if(userId !== listObj[i].userId && userId === listObj[i].nowId) {
			ret.push(listObj[i]);
		}
	}

	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	resData.data = ret;

	callback && callback.call(this, resData);
	return this;
};

/*
 *用途:获取:我的瓶子--扔出去的瓶子列表
 *参数:userId 用户的userId
 *参数:callback 操作完成后的回调
 *回调参数:callback(data)
 *用例:bottleModel.getThrowBotList(1, function(data) {});
**/
bottleModel.getThrowBotList = function(userId, callback) {
	var resData = {};
	var listObj = readBotList();
	
	var ret = [];
	userId = parseInt(userId, 10);
	for(var i = 0; i < listObj.length; i++) {
		if(userId === listObj[i].userId) {
			ret.push(listObj[i]);
		}
	}
	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	resData.data = ret;

	callback && callback.apply(this, [resData]);
	return this;
};

/*
 *用途:获取某个漂流瓶详情
 *参数:bottleId 漂流瓶的bottleId
 *参数:callback 操作完成后的回调
 *回调参数:callback(data)
 *用例:bottleModel.getBottleDetail(1, function(data) {});
**/
bottleModel.getBottleDetail = function(bottleId, callback) {
	var listObj = readBotList();
	var resData = {};
	var data = null;
	bottleId = bottleId;
	for(var i = 0; i < listObj.length; i++) {
		if(bottleId === listObj[i].bottleId) {
			data = listObj[i];
			break;
		}
	}

	resData.data = data;
	if(data) {
		var backList = readBotMsgList();
		var ret = [];
		for(var j = 0; j < backList.length; j++) {
			if(bottleId === backList[j].bottleId) {
				ret.push(backList[j]);
			}
		}
		resData.data.msgList = ret;

		resData.rtnCode = "000";
		resData.rtnMsg = "success";
	}else {
		resData.rtnCode = "111";
		resData.rtnMsg = "fail";
	}
	
	
	callback && callback.apply(this, [resData]);
	return this;
};

/*
 *用途:创建一个漂流瓶
 *参数:data.userId 创建漂流瓶用户的userId
 *参数:data.type 漂流瓶的类型
 *参数:data.title 漂流瓶的标题
 *参数:data.content 漂流瓶的内容
 *参数:callback 操作完成后的回调
 *回调参数:callback(data) 
 *用例:bottleModel.createBottle({userId: 1, type: 2, title: "标题1", content: "内容1"}, function(data) {});
**/
bottleModel.createBottle = function(data, callback) {
	var resData = {};
	var listObj = readBotList();
	var bottleId = parseInt(listObj[listObj.length - 1].bottleId, 10) + 1;
	var nowTime = timeFormat(Date.now());

	//获取 nickName
	var nickName = null;
	userModel.getUserDetail(data.userId, function(res) {
		nickName = res.data.nickName;
	});

	var newBottle = {
		bottleId: bottleId,
		userId: data.userId,
		nickName: nickName,
		type: data.type,
		title: data.title,
		content: data.content,
		createTime: nowTime,
		lastTime: nowTime,
		nowId: null
	};
	listObj.push(newBottle);
	writeBotList(listObj)

	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	callback && callback.apply(this, [resData]);
	return this;
};

/*
 *用途:删除漂流瓶
 *参数:options.bottleId 漂流瓶的bottleId
 *参数:options.userId 用户的userId
 *参数:callback 操作完成之后的回调
 *回调参数:callback(data)
 *用例:bottleModel.delBottleById({userId: 1, bottleId: 1}, function(data) {});
**/
bottleModel.delBottleById = function(options, callback) {
	var resData = {};
	var listObj = readBotList();
	var bottleId = options.bottleId;
	var delFlag = false;
	for(var i = 0; i < listObj.length; i++) {
		if(bottleId === listObj[i].bottleId && (options.userId === listObj[i].userId || options.userId === listObj[i].nowId)) {
			delFlag = true;
			listObj.splice(i, 1);
			break;
		}
	}

	if(delFlag) {
		var backList = readBotMsgList();
		for(var x = backList.length - 1, y = 0; x >= y; x--) {
			if(bottleId === backList[x].bottleId) {
				backList.splice(x, 1);
			}
		}
		writeBotMsgList(backList);
	}

	writeBotList(listObj)

	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	callback && callback.apply(this, [resData]);

	return this;
};

/*
 *用途:回复漂流瓶
 *参数:options.bottleId 漂流瓶的bottleId
 *参数:options.userId 回复者的用户userId
 *参数:options.msg 回复漂流瓶的内容
 *参数:callback 操作完成后的回调
 *回调参数:callback(data)
 *用例:bottleModel.backToBottle({bottleId: 1, userId: 1, msg: "你好"
}, function(data) {});
**/
bottleModel.backToBottle = function(options, callback) {
	var resData = {};
	var listObj = readBotMsgList();
	var bottleId = options.bottleId;

	//获取 nickName
	var nickName = null;
	userModel.getUserDetail(options.userId, function(res) {
		nickName = res.data.nickName;
	});
	var msgId = listObj[listObj.length - 1].msgId + 1;
	listObj.push({
		msgId: msgId,
		bottleId: bottleId,
		userId: options.userId,
		nickName: nickName,
		msg: options.msg,
		time: timeFormat(Date.now())
	});

	writeBotMsgList(listObj);
	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	callback && callback.apply(this, [resData]);
	return this;
};


/*
 *用途:随机获取一个瓶子
 *参数:userId 用户自己的id
 *参数:callback 操作完成后的回调
 *回调参数:callback(data) 
 *函数注意点1:有可能捞到的不是瓶子
 *函数注意点2:不能捞到已捞到的瓶子
 *函数注意点3:捞到的瓶子是随机的但不能是自己的
 *用例:bottleModel.getRandomBottle(1, function(data) {});
**/
bottleModel.getRandomBottle = function(userId, callback) {
	var resData = {};
	var listObj = readBotList();
	var getBottleId = null;//最终选择到的id

	if(Math.random() < 0.7) {//捞取成功,70%成功率
		//能获取到的瓶子列表
		var canGetList = [];
		for(var i = 0; i < listObj.length; i++) {
			//只要该瓶子是自己的,或者已被人捡起了,都不能再捡到
			if(userId === listObj[i].userId || listObj[i].nowId) {
				continue;
			}
			canGetList.push(listObj[i]);
		}
		if(canGetList.length) {
			//从列表中随机获取一个
			var index = parseInt(Math.random() * canGetList.length, 10);
			resData.data = canGetList[index];
			getBottleId = canGetList[index].bottleId;
			resData.rtnCode = "000";
			resData.rtnMsg = "捞到一个瓶子";
		}else {//所有的瓶子都没有了
			resData.rtnCode = "111";
			resData.rtnMsg = "海里已经没有多余的瓶子了";
		}

		
	}else {//捞取到星星
		resData.rtnCode = "111";
		resData.rtnMsg = "你捞到了一个星星";
	}

	//将被捞到的瓶子的nowId变更
	if(getBottleId) {
		for(var j = 0; j < listObj.length; j++) {
			if(getBottleId === listObj[j].bottleId) {
				listObj[j].nowId = userId;
				break;
			}
		}
		writeBotList(listObj)
	}

	callback && callback.apply(this, [resData]);
	return this;
};

/*
 *用途:将瓶子扔回海里
 *参数:options.userId 用户自己的userId
 *参数:options.bottleId 漂流瓶的bottleId
 *参数:callback 操作完成之后的回调
 *回调参数:callback(data)
 *用例:bottleModel.backToSea({userId: 1, bottleId: 1}, function(data) {});
**/
bottleModel.backToSea = function(options, callback) {
	var resData = {};
	var listObj = readBotList();

	for(var i = 0; i < listObj.length; i++) {
		if(options.bottleId === listObj[i].bottleId && options.userId === listObj[i].nowId) {
			listObj[i].nowId = null;
			break;
		}
	}

	writeBotList(listObj)
	resData.rtnCode = "000";
	resData.rtnMsg = "success";
	callback && callback.call(this, resData);
	return this;
};
module.exports = bottleModel;