var $bottleMod = $(".bottle-mod");
//功能-获取cookie
var getCookie = function(name) {
	var arr,reg=new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
};
//功能-删除cookie
var delCookie = function(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if(cval!=null) {
		document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}
};
//功能-渲染函数
var renderDmo = function(htmlId, tempId, data) {
	var tpl = _.template($(tempId).html()),
        html = tpl(data);
    
    $(htmlId).empty().html(html);
};

//我的瓶子逻辑--start
//异步-我的瓶子--收到的瓶子
var getReceivedBotList = function(callback) {
	$.ajax({
		url: "./bottle/getReceivedBotList",
		type: "post",
		data: {},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}else {//没有登录
				if(window.confirm("没有登录,请前往登录")) {
					window.location.href = "./login.html";
				}
			}
		}
	});
};
//异步-获取瓶子列表--扔出去的
var getThrowBotList = function(callback) {
	$.ajax({
		url: "./bottle/getThrowBotList",
		type: "post",
		data: {},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}else {//没有登录
			}
		}
	});
};
$bottleMod.delegate(".bot-tools .tool-item-my", "click", function() {
	//打开我的瓶子窗口
	$(".bottle-mod .con-item").removeClass("show");
	$(".bottle-mod .con-item-my").addClass("show");
	getThrowBotList(function(data) {	
		renderDmo("#html-bot-list-self", "#temp-bot-list-self", {
			list: data
		});
	});
	getReceivedBotList(function(data) {
		renderDmo("#html-bot-list-others", "#temp-bot-list-self", {
			list: data
		});
	});
}).delegate(".bot-tool-con .con-btn-close", "click", function() {
	//关闭我的瓶子窗口
	$(this).parents(".con-item").removeClass("show");
}).delegate(".tab-h-box .tab-h-item", "click", function() {
	//扔出去的,收到的切换
	var $this = $(this),
		index = $this.index();
	$(".tab-h-box .tab-h-item").removeClass("active").eq(index).addClass("active");
	$(".tab-c-box .tab-c-item").removeClass("active").eq(index).addClass("active");
});
//我的瓶子逻辑--end

//扔瓶子逻辑--start
//异步-扔个瓶子
var createBottle = function(data, callback) {
	if(!data.userId) {
		alert("登录后才能扔瓶子哦");
		return;
	}else if(data.type === "") {
		alert("类型不能为空");
		return;
	}else if(data.title === "") {
		alert("标题不能为空");
		return;
	}else if(data.content === "") {
		alert("内容不能为空");
		return;
	}

	$.ajax({
		url: "./bottle/createBottle",
		type: "post",
		data: data,
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}else {//没有登录
				alert(res.rtnMsg);
			}
		}
	});
};
$bottleMod.delegate(".bot-tools .tool-item-set", "click", function() {
	//打开扔瓶子窗口
	$(".bottle-mod .con-item").removeClass("show");
	$(".bottle-mod .con-item-set").addClass("show");
}).delegate(".con-item-set .con-btn-sure", "click", function() {
	//扔瓶子确认
	var data = {};
	data.userId = getCookie("userId");
	data.type = $(".con-item-set .send-bot-type").val();
	data.title = $(".con-item-set .send-bot-title").val();
	data.content = $(".con-item-set .send-bot-content").val();

	createBottle(data, function(data) {
		$(".bottle-mod .con-item-set").removeClass("show");
	});
});
//扔瓶子逻辑--end

//瓶子详情逻辑--start
//异步--回复漂流瓶
var getBackBottle = function(data, callback) {
	data.userId = getCookie("userId");
	if(data.msg === "") {
		alert("回复内容不能为空")
		return;
	}else if(!data.userId) {
		alert("登录失效,请重新登录.")
		return;
	}
	$.ajax({
		url: "./bottle/backToBottle",
		type: "post",
		data: data,
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}else {
				alert(res.rtnMsg);
			}
		}
	});
};
//异步-获取瓶子详情
var getBottleDetail = function(bottleId, callback) {
	$.ajax({
		url: "./bottle/getBottleDetail",
		type: "post",
		data: {
			bottleId: bottleId
		},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}
		}
	});
};
//异步--扔回海里
var backToSea = function(bottleId, callback) {
	$.ajax({
		url: "./bottle/backToSea",
		type: "post",
		data: {
			bottleId: bottleId
		},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}
		}
	});
};
//异步--沉入海底
var submerToSea = function(bottleId, callback) {
	$.ajax({
		url: "./bottle/delBottleById",
		type: "post",
		data: {
			bottleId: bottleId
		},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}
		}
	});
};
//功能--渲染详情窗口并打开
var renderBotDetail = function(data, callback) {
	renderDmo("#html-bot-detail", "#temp-bot-detail", {
			data: data
		});
	$(".bot-detail-box").addClass("show");
};
$bottleMod.delegate(".bot-detail-box .bot-d-close", "click", function() {//关闭详情窗口
	$(".bot-detail-box").removeClass("show");
}).delegate(".bot-list-item", "click", function() {//打开详情窗口
	var $this = $(this),
		id = $this.attr("data-id");

	getBottleDetail(id, function(data) {
		renderBotDetail(data);
	});
}).delegate(".bot-detail-box .bot-d-send", "click", function() {
	//回复漂流瓶
	var data = {},
		$this = $(this);

	data.bottleId = $(".bot-detail-box .bot-d-inter").attr("data-id");
	data.msg = $.trim($(".bot-detail-box .bot-d-textarea").val());

	getBackBottle(data, function() {
		alert("回复成功");
		$(".bot-detail-box").removeClass("show");
	});
}).delegate(".bot-d-back", "click", function() {//扔回海里
	var $this = $(this),
		bottleId = $this.parents(".bot-d-inter").attr("data-id");

	backToSea(bottleId, function(data) {
		$("#html-bot-detail").removeClass("show");
		getReceivedBotList(function(data) {
			renderDmo("#html-bot-list-others", "#temp-bot-list-self", {
				list: data
			});
		});
		alert("瓶子已扔回海里了");
	});
}).delegate(".bot-d-down", "click", function() {//厌恶,沉入海底
	var bottleId = $(this).parents(".bot-d-inter").attr("data-id");

	if(window.confirm("你确定要将瓶子沉入海底吗？")) {
		submerToSea(bottleId, function(data) {
			$("#html-bot-detail").removeClass("show");
			getReceivedBotList(function(data) {
				renderDmo("#html-bot-list-others", "#temp-bot-list-self", {
					list: data
				});
			});
			alert("瓶子已沉入海底了");
		});
	}
});
//瓶子详情逻辑--end

//捡瓶子逻辑--start
//异步--捡瓶子
var getRandomBottle = function(callback) {
	$.ajax({
		url: "./bottle/getRandomBottle",
		type: "post",
		data: {},
		success: function(res) {
			if(res.rtnCode === "000") {
				callback && callback(res.data);
			}else {
				alert(res.rtnMsg);
			}
		}
	});
};
$bottleMod.delegate(".tool-item-get", "click", function() {
	//捡瓶子
	getRandomBottle(function(data) {
		if(window.confirm("你捡到一个瓶子,是否打开？")) {
			renderBotDetail(data);
		}
	});
});
//捡瓶子逻辑--end

//退出登录
$bottleMod.delegate(".login-item-box .login-out", "click", function() {
	delCookie("userId");
	$(".login-item-box .item-yes").show();
	$(".login-item-box .item-no").hide();
});


(function(){
	//判断是否登录
	if(getCookie("userId")) {//已登录
		$(".login-item-box .item-yes").hide();
		$(".login-item-box .item-no").show();
	}else {//未登录
		$(".login-item-box .item-yes").show();
		$(".login-item-box .item-no").hide();
	}
})()