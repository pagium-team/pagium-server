"use strict";

/**
 * tools 工具模块
 *
 * @author sam.sin
 * @class loader
 * @constructor
 */
module.exports = {
	/**
     * 动态随机id
     * @property uuid 
     * @type Object
     * @static
     */
	uuid: require("./uuid.js"),

	/**
     * fs 扩展
     * @property fsExtend 
     * @type Object
     * @static
     */
	fsExtend: require("./fsExtend"),

	/**
     * 日期工具
     * @property dateTool 
     * @type Object
     * @static
     */
	dateTool: require("./dateTool")
}