'use strict';

var express = require("express");
var app = express();
var meta = require("./package.json");
var bodyParser = require("body-parser");
var eventDispatch = require("./eventDispatch");
var em = require("./libs/eagle-mysql/eagleMysql");
var dbConf = require("./conf").dbConf;

/**
 * app 设置
 *
 * @author sam.sin
 * @class app
 * @constructor
 */
app.set("version", meta.version);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + "/../app")); // 静态资源目录
app.set("port", process.env.PORT || 3333); // 端口
app.use(require("./router")()); // 路由
eventDispatch(); // 事件分派器
em.init(dbConf); // 初始化数据库

var builder = require("./engine/commander").builder;
builder.preview(2);