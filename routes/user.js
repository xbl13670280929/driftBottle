var express = require("express");
var router = express.Router();
var userModel = require("../sql/user");

//统一设置
router.all("/user/*", function(req, res, next) {
	res.set("Content-Type", "application/json;charset=UTF-8");
	next();
});
//路由--添加新用户
router.use("/user/add", function(req, res) {
	var data = {
		username: req.body.username,
		password: req.body.password,
		nickName: req.body.nickName
	};

	userModel.addUser(data, function(data) {
		res.end(JSON.stringify(data));
	});
});

//路由--登录
router.use("/user/login", function(req, res) {
	var data = {
		username: req.body.username,
		password: req.body.password
	};

	userModel.login(data, function(data) {
		if(data.userId) {
			res.cookie("userId", data.userId, {expires: new Date(Date.now() + 900000)});
		}
		res.end(JSON.stringify(data));
	});
});

module.exports = router;