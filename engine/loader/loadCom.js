"use strict";

var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var walk = require("walk"); // 爬虫器
var fs = require("fs"); // 文件读写模块
var globalConf = require("../../global"); // 文件读写模块
var allComs = {}; // 所有数据缓存
var projectModule = require("../../modules/project");

/**
 * 获取真实组件数据
 *
 * @param {Number} projectId 项目id
 * @param {String} projectName 项目名称
 * @param {Function} callback 回调方法
 * @method _getRealComs
 */
var _getRealComs = function(projectId, projectName, callback) {
	var o = {}; //文件关联对象
	var walker = walk.walk(globalConf.__base + "/prds/" + projectId + "/components/");

	/**
	 * 检测到文件
	 *
	 * @event on file
	 */
	walker.on("file", function(root, fileStats, next) {
		if (fileStats.name === "pagium.json") { // pagium.json 文件
			var pathname = root.substr(root.indexOf("components/") + 12);
			if (!o[pathname]) {
				o[pathname] = {
					code: pathname,
					name: pathname,
					dataContent: ""
				};
			}
			var contentText = fs.readFileSync(root + "/" + fileStats.name, "utf-8");
			var contentObj = JSON.parse(contentText);
			if (contentObj.code) {
				o[pathname]["code"] = contentObj.code;
			}
			if (contentObj.name) {
				o[pathname]["name"] = contentObj.name;
			}
		}

		if (fileStats.name === "data.js") { // data.js 文件
			var pathname = root.substr(root.indexOf("components/") + 12);
			if (!o[pathname]) {
				o[pathname] = {
					code: pathname,
					name: pathname,
					dataContent: ""
				};
			}
			var contentText = fs.readFileSync(root + "/" + fileStats.name, "utf-8");
			if (contentText && contentText.trim()) {
				o[pathname]["dataContent"] = contentText;
			}
		}

		next();
	});

	/**
	 * 检测爬虫结束
	 *
	 * @event on end
	 */
	walker.on("end", function() {
		var comList = [];
		for (var key in o) {
			comList.push(o[key]);
		}
		allComs[projectId] = comList;
		callback && callback(response(resObj.success, {
            projectName: projectName,
            comList: comList
        }));
	});
}

/**
 * Returns 返回组件所有数组数据
 *
 * @param {String} projectId 项目id
 * @param {Function} callback 回调方法
 * @method load
 * @return {Array} 
 */
var load = function(projectId, callback) {
	projectModule.getProjectNameById(projectId, function(resp) {
		if (resp.code == resObj.success.code) {
			var projectName = resp.data.projectName;
			if (!allComs[projectId] || allComs[projectId].length === 0) {
				_getRealComs(projectId, projectName, callback);
			} else {
				callback && callback(response(resObj.success, {
					projectName: projectName,
					comList: allComs[projectId]
				}));
			}
		} else {
			callback && callback(resp);			
		}
	});
}

/**
 * 更新缓存数据
 *
 * @param {String} projectId 项目id
 * @method updateAllComs
 * @return {Object} 
 */
var updateAllComs = function(projectId) {
	allComs[projectId] = null;
}

/**
 * loadcom 组件解析器
 * @class loadcom
 * @author rahul.wu
 * @constructor
 */
module.exports = {
	load: load,
	updateAllComs: updateAllComs
}
