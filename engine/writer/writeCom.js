'use strict';

var fs = require("fs"); // 文件读写模块
var globalConf = require("../../global"); // 全局变量

/**
 * 写单个组件数据文件
 *
 * @param {String} projectId 项目 id
 * @param {Object} com 组件对象
 * @param {Function} callback 回调方法
 * @method _writeSingleCom
 */
var _writeSingleCom = function(projectId, com, callback) {
	var comCode = com.code;
	var dataKey = com.dataKey;
	var dataContent = com.dataContent;

	var floderPath = globalConf.__base + "/prds/" + projectId +"/components/" + comCode + "/";
		
	fs.writeFileSync(floderPath + dataKey + ".js", dataContent);

	callback && callback();
}

/**
 * 写组件数据文件
 *
 * @param {String} projectId id
 * @param {Object} buildData 打包数据
 * @param {Function} callback 回调方法
 * @method writePages
 */
var writeComDatas = function(projectId, buildData, callback) {
	var pageIndex = 0;
	
	var walkPages = function() {
		if (pageIndex < buildData.length) {
			var coms = buildData[pageIndex].coms;

			var comIndex = 0;

			var walkComs = function() {
				if (comIndex < coms.length) {
					_writeSingleCom(projectId, coms[comIndex], function() {
						++comIndex;
						walkComs();
					});
				} else {
					++pageIndex;
					walkPages();
				}
			}

			walkComs();
		} else {
			callback && callback();
		}
	}
	
	walkPages();
}

/**
 * writecom 组件写入器
 *
 * @class writecom
 * @author fsiaonma
 * @constructor
 */
module.exports = {
	writeComDatas: writeComDatas
}