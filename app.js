var express = require("express");
var app = express();

//获取req.body
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));

//引入静态文件
app.use(express.static(__dirname + '/public'));

//路由群
app.use(require("./routes/user"));
app.use(require("./routes/bottle"));


app.listen(8090);

console.log("localhost:8090/index.html");