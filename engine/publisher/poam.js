"use strict";

var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var ftpClient = require("../../libs/ftp-client");
var ftpConfig = require("../../conf/ftpConf");
var globalConf = require("../../global"); // 文件读写模块

/**
 * 推送页面
 *
 * @param {Number} projectId 项目 id 
 * @param {String} pageName 页面名称 
 * @param {Function} callback 回调方法
 * @method pushPage
 */
var pushPage = function(projectId, pageName, callback) {
	var client = new ftpClient(ftpConfig, {
		logging: "debug",
		overwrite: "all"
	});

	client.connect(function() {
		// 上传项目
	 	client.upload([
	 		globalConf.__base + "/prds/" + projectId + "/output/" + pageName + ".html"
	 	], "/oam/layouts/" + projectId + "/", {
	 		baseDir: globalConf.__base + "/prds/" + projectId + "/output/",
	        overwrite: "all"
	    }, function (result) {
	    	if (result.status == "success") {
	        	callback && callback(response(resObj.success))
	    	}
	    });
	});
}

/**
 * 推送公共库
 *
 * @param {Number} projectId 项目 id 
 * @param {Function} callback 回调方法
 * @method pushLib
 */
var pushLib = function(projectId, callback) {
	var client = new ftpClient(ftpConfig, {
		logging: "debug",
		overwrite: "all"
	});
	client.connect(function() {
		// 上传项目
	 	client.upload([
	 		globalConf.__base + "/prds/" + projectId + "/views/lib/**"
	 	], "/oam/layouts/" + projectId + "/", {
	 		baseDir: globalConf.__base + "/prds/" + projectId + "/output/",
	        overwrite: "all"
	    }, function (result) {
	    	if (result.status == "success") {
	        	callback && callback(response(resObj.success))
	    	}
	    });
	});
}


/**
 * poam 活动前端页面发布器
 * @class poam
 * @author sam.sin
 * @constructor
 */
module.exports = {
	pushPage: pushPage,
	pushLib: pushLib
}