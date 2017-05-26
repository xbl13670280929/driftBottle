var express = require("express");
var router = express.Router();
var bottleModel = require("../sql/bottle");

//将cookie设置成json格式
var parseCookie = function(str) {
	var arr, obj = {};
	if(str && typeof str === "string") {
		arr = str.split("=");
		for(var i = 0; i < arr.length; i+=2) {
			obj[arr[i]] = arr[i+1];
		}
	}
	return obj || {};
};

//统一拦截登录
router.all("/bottle/*", function(req, res, next) {
	var cookieObj = parseCookie(req.headers.cookie);
	var userId = parseInt(cookieObj.userId, 10);

	res.set("Content-Type", "application/json;charset=UTF-8");
	if(userId) {//已登录
		res.locals.userId = userId;
		next();
	}else {
		res.end(JSON.stringify({
			rtnCode: "502",
			rtnMsg: "请先登录"
		}));
	}
});

//路由--我的瓶子--收到的瓶子列表
router.use("/bottle/getReceivedBotList", function(req, res, next) {
	var userId = res.locals.userId;
	bottleModel.getReceivedBotList(res.locals.userId, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--我的瓶子--扔出去的瓶子列表
router.use("/bottle/getThrowBotList", function(req, res) {
	var userId = res.locals.userId;
	bottleModel.getThrowBotList(userId, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--获取某个漂流瓶详情 
router.use("/bottle/getBottleDetail", function(req, res) {
	var bottleId = parseInt(req.body.bottleId, 10);
	bottleModel.getBottleDetail(bottleId, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--创建一个漂流瓶
router.use("/bottle/createBottle", function(req, res) {
	var data = {
		userId: res.locals.userId,
		type: req.body.type,
		title: req.body.title,
		content: req.body.content
	};
	bottleModel.createBottle(data, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--回复漂流瓶
router.use("/bottle/backToBottle", function(req, res) {
	var data = {
		bottleId: parseInt(req.body.bottleId, 10),
		userId: res.locals.userId,
		msg: req.body.msg
	};
	bottleModel.backToBottle(data, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--随机获取一个瓶子
router.use("/bottle/getRandomBottle", function(req, res) {
	var userId = res.locals.userId;
	bottleModel.getRandomBottle(userId, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--扔回海里
router.use("/bottle/backToSea", function(req, res) {
	var userId = res.locals.userId;
	var bottleId = parseInt(req.body.bottleId, 10);

	bottleModel.backToSea({userId: userId, bottleId: bottleId}, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--沉入海底
router.use("/bottle/delBottleById", function(req, res) {
	var userId = res.locals.userId;
	var bottleId = parseInt(req.body.bottleId, 10);

	bottleModel.delBottleById({userId: userId, bottleId: bottleId}, function(data) {
		res.end(JSON.stringify(data));
	});
});

module.exports = router;