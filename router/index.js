'use strict';

var express = require('express');
var router = express.Router();

var response = require("../utils/net").response;
var resObj = require("../conf").resObj;
var globalConf = require("../global"); // 全局变量

var checkSid = function(sid) {
	var flag = false;
	var sessions = globalConf.__sessions;
	for (var i = 0; i < sessions.length; ++i) {
		var session = sessions[i];
		if (session.sid == sid && new Date().getTime() - session.createTime < globalConf.__sessionDelay) {
			flag = true;
		}
	}
	return flag;
}

/**
 * node端：API 路由
 *
 * @class router
 * @author sam.sin
 * @constructor
 */
module.exports = function() {
	// 设置请求头
	router.all('*', function(req, res, next) {
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	    res.header("X-Powered-By", '3.2.1');
	    res.header("Content-Type", "application/json;charset=utf-8");

	    if (req.params[0] != "/login" && req.params[0] != "/projectFile") {
	    	var sid = req.query.sid || req.body.sid || req.params.sid;
	    	
	    	if (!sid) {
		    	res.send(response(resObj.sidDisable));
		    	return ;	
		    }
		    if (!checkSid(sid)) {
		    	res.send(response(resObj.sidDisable));
		    	return ;
		    }
	    }

	    next();
	});

	require("./user")(router); // 用户 api
	require("./role")(router); // 角色 api
	require("./menu")(router); // 菜单 api
	require("./project")(router); // 项目相关 api
	require("./page")(router); // 页面相关 api
	require("./com")(router); // 组件相关 api
    return router;
};