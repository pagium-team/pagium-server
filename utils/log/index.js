"use strict";

var fs = require("fs");
var globalConf = require("../../global"); // 全局变量

/**
 * net 网络模块
 *
 * @author sam.sin
 * @class loader
 * @constructor
 */
module.exports = {
	write: function(content) {
		var date = new Date();
		fs.writeFileSync(globalConf.__base + "/log/log", content + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "\n" , {flag: "a"});
	}
}