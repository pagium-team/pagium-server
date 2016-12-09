'use strict';

var exec = require('child_process').exec;
var fs = require("fs"); // 文件读写模块
var walk = require("walk"); // 爬虫器
var pagiumRelease = require("pagium-command-release");
var pagiumServer = require("pagium-command-server");

var globalConf = require("../../global"); // 文件读写模块

var pageLoader = require("../loader").loadPage; // 页面加载器
var comLoader = require("../loader").loadCom; // 组件加载器

var pageWriter = require("../writer").writePage; // 页面写入器
var comWriter = require("../writer").writeCom; // 组件写入器

var pageModule = require("../../modules/page"); // 页面模块
var comModule = require("../../modules/com"); // 组件模块

var log = require("../../utils/log");

var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;

/**
 * _writeFile 写文件
 *
 * @param {String} projectId 项目名称
 * @param {Object} buildData 打包数据
 * @param {function} callback 回调方法
 * @method _writeFile
 */
var _writeFile = function(projectId, buildData, callback) {
	pageWriter.writePages(projectId, buildData, function(resp) {
		comWriter.writeComDatas(projectId, buildData, function(resp) {
			callback && callback();
		});
	});
}

/**
 * build 数组构造
 *
 * @param {number} projectId 项目id
 * @param {number} pageList 页面集合
 * @param {function} callback 回调方法
 * @method _buildDataCtor
 */
var _buildDataCtor = function(projectId, pageList, callback) {
	pageModule.getPageDetailByPageIds(pageList, function(pageResp) {
		pageModule.getComsByPages(pageList, function(comResp) { // 获取所有页面组件
			var dataKeys = [];
			for (var i = 0, len = comResp.data.length; i < len; ++i) {
				dataKeys.push(comResp.data[i].DATA_KEY);
			}
			comModule.getDatesByDataKeys(dataKeys, function(comDataResp) { // 获取所有组件数据
				var buildData = combindData(pageResp.data, comResp.data, comDataResp);
				callback && callback(buildData);
			});
		});
	});

	function combindData(pageList, coms, comDatas) {
		var buildData = [];
		for (var i = 0, len = pageList.length; i < len; ++i) {
			var pageId = pageList[i].id;
			var pageName = pageList[i].name;
			buildData.push({
				pageId: pageId,
				pageName: pageName,
				pageParams: pageList[i],
				coms: []
			});
			for (var j = 0; j < coms.length; ++j) {
				var com = coms[j];
				if (pageId == com.PAGE_ID) {
					buildData[buildData.length - 1].coms.push({
						code: com.CODE,
						dataKey: com.DATA_KEY,
						dataContent: ""
					})
					for (var t = 0; t < comDatas.length; ++t) {
						var comData = comDatas[t];
						if (com.DATA_KEY == comData.DATA_KEY) {
							var buildComs = buildData[buildData.length - 1].coms;
							buildComs[buildComs.length - 1].dataContent = comData.CONTENT;
						}
					}
				}
			}
		}
		return buildData;
	}
}

/**
 * preview 预览编译命令
 *
 * @param {Number} projectId 项目id
 * @param {Function} callback 回调
 * @method preview
 */
var preview = function(projectId, pageId, callback) {
	if (globalConf.__projectFileLock) {
        callback && callback(response(resObj.fileOperating));
        return ;
    }

    globalConf.__projectFileLock = true;
    var pageList = [pageId];
	_buildDataCtor(projectId, pageList, function(resp) { // build 数据准备
		_writeFile(projectId, resp, function() { // 写文件
			// 运行打包命令
			console.log("sys start to release .......");

			var projectPath = globalConf.__base + "/prds/" + projectId;
			pagiumRelease.run(projectPath, {
				pageName: resp[0].pageName,
				callback: function() {
					pagiumServer.run(projectPath);
					// 执行回调
					globalConf.__projectFileLock = false;
					callback && callback(response(resObj.success));
				}
			});
		});
	}); 
}

/**
 * build 生成内嵌 html
 *
 * @param {Number} projectId 项目id
 * @param {Function} callback 回调
 * @method build
 */
var build = function(projectId, pageId, callback) {
	if (globalConf.__projectFileLock) {
        callback && callback(response(resObj.fileOperating));
        return ;
    }

    globalConf.__projectFileLock = true;
    var pageList = [pageId];
	_buildDataCtor(projectId, pageList, function(resp) { // build 数据准备
		_writeFile(projectId, resp, function() { // 写文件
			// 运行打包命令
			console.log("sys start to package .......");
			
			var projectPath = globalConf.__base + "/prds/" + projectId;
			pagiumRelease.run(projectPath, {
				pageName: resp[0].pageName,
				optimize: true,
				callback: function() {
					pagiumServer.run(projectPath);
					// 执行回调
					globalConf.__projectFileLock = false;
					callback && callback(response(resObj.success));
				}
			});
		});
	}); 
}

/**
 * builder 打包编译命令
 *
 * @class build
 * @author sam.sin
 * @constructor
 */
module.exports = {
	preview: preview,
	build: build
}