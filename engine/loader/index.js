"use strict";

/**
 * loader 文件加载解析器
 *
 * @author sam.sin
 * @class loader
 * @constructor
 */
module.exports = {
     /**
      * 组件解析器
      * @property loadCom 
      * @type Object
      * @static
      */
	loadCom: require("./loadCom"),

	/**
      * 页面解析器
      * @property loadPage 
      * @type Object
      * @static
      */
	loadPage: require("./loadPage")
}