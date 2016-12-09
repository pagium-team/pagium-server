"use strict";

/**
 * writer 文件写入器
 *
 * @author sam.sin
 * @class writer
 * @constructor
 */
module.exports = {
	/**
	 * 页面写入器
	 * @property writePage 
	 * @type Object
	 * @static
	 */
	writePage: require("./writePage"),
	
	/**
	 * 组件写入器
	 * @property writeCom 
	 * @type Object
	 * @static
	 */
	writeCom: require("./writeCom")
}