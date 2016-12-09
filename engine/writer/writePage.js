'use strict';

var fs = require("fs"); // 文件读写模块
var globalConf = require("../../global"); // 全局变量

/**
 * 写页面
 *
 * @param {String} projectId 项目id
 * @param {Object} pageName 页面名称
 * @param {Object} pageParams 页面参数
 * @param {Object} coms 组件集合
 * @param {Function} callback 回调方法
 * @method writePages
 */
var _writeSinglePage = function(projectId, pageName, pageParams, coms, callback) {
	var pageContent = fs.readFileSync(globalConf.__base + "/prds/" + projectId + "/views/templates/" + pageParams.tplName + ".html", "utf-8");

	var title = pageParams.title;
	pageContent = pageContent.replace("<!--[TITLE]-->", "<title>" + title + "</title>");

	var meta = pageParams.meta;
	pageContent = pageContent.replace("<!--[META]-->", meta);

	var components = (function() {
		var cStr = "";
		for (var i = 0, len = coms.length; i < len; ++i) {
			var component = coms[i];
			cStr += '\t{{{unit name="' + component.code + '" data="' + component.dataKey + '"}}}\r\n';
		}
		cStr = cStr.substring(1, cStr.length-2);
		return cStr;
	})();
	pageContent = pageContent.replace("<!--[COMPONENTS]-->", components);

	var floderPath = globalConf.__base + "/prds/" + projectId +"/views/products/";
	if (!fs.existsSync(floderPath)) {
		fs.mkdirSync(floderPath);
	}
	fs.writeFileSync(floderPath + "/" + pageName + ".html", pageContent);
	callback && callback();
}

/**
 * 写页面
 *
 * @param {String} projectId 项目名称
 * @param {Object} buildData 打包数据
 * @param {Function} callback 回调方法
 * @method writePages
 */
var writePages = function(projectId, buildData, callback) {
	var index = 0;
	
	var walkPages = function() {
		if (index < buildData.length) {
			var pageName = buildData[index].pageName;
			var pageParams = buildData[index].pageParams;
			var coms = buildData[index].coms;
			_writeSinglePage(projectId, pageName, pageParams, coms, function() {
				++index;
				walkPages();
			});
		} else {
			callback && callback();
		}
	}
	
	walkPages();
}

/**
 * writePage 页面写入器
 *
 * @class writePage
 * @author sam.sin
 * @constructor
 */
module.exports = {
	writePages: writePages
}