"use strict";

/**
 * 返回结果代码集
 *
 * @author sam.sin
 * @class conf
 * @constructor
 */
module.exports = {
	/**
      * 结果编码集
      * @property response 
      * @type Object
      * @static 
      */
	resObj: require("./resObj"),

     /**
      * ftp 配置
      * @property response 
      * @type Object
      * @static 
      */
	ftpConf: require("./ftpConf"),

	/**
      * db 配置
      * @property response 
      * @type Object
      * @static 
      */
	dbConf: require("./dbConf")
}