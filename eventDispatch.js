"use strict";

var globalConf = require("./global");
var loader = require("./engine/loader");

/**
 * node端: 事件分派器
 *
 * @class dispatch
 * @author sam.sin
 * @constructor
 */
module.exports = function() {
	/**
	 * 页面发生改动事件 
	 * 
	 * @event on writePage
	 */
	globalConf.__emitter.on("writePage", function(resp) {
		loader.loadPage.updateAllPages(resp.projectId);
	});

	/**
	 * 组件发生改动事件 
	 * 
	 * @event on writeCom
	 */
	globalConf.__emitter.on("writeCom", function(resp) {
		loader.loadCom.updateAllComs(resp.projectId);
	});
}