'use strict';

/**
 * components功能
 *
 * @author fsiaonma
 */
var tools = require("../../utils/tools");
var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var fs = require("fs"); // 文件读写模块
var globalConf = require("../../global"); // 全局变量
var em = require("../../libs/eagle-mysql/eagleMysql");
var sqlCondtion = require("../../libs/eagle-mysql/sqlCondition");
var projectModule = require("../../modules/project");

/**
 * 保存 comData 内容 
 *
 * @param {String} dataContent 内容
 * @param {Function} callback 回调方法
 * @method _saveData
 */
var _saveData = function(dataContent, callback) {
	var dataKey = "data-" + tools.uuid();
	var dataContent = dataContent;

 	var insertParams = {                             
		table  : "t_component_data",                      
		keys   : ["DATA_KEY", "CONTENT"],                       
		values : [dataKey, dataContent]                        
	}; 
	em.connect();                                              
	em.insert(insertParams, {                
		success : function (data) {
			callback && callback(response(resObj.success, {
				dataKey: dataKey
			}));               
		},                                           
		error : function (err) {                     
			callback && callback(response(resObj.addComFail));                   
		}                                            
	});
	em.disconnect();
}

/**
 * Returns 根据data名称值获取组件数据源对象
 *
 * @param {String} dataKey 数据源名称
 * @param {Function} callback 回调方法
 * @method getDataByDataKey
 */
var getDataByDataKey = function(dataKey, callback) {
	var selParams = {                                                                
        keys       : ['CONTENT'],                                                   
        table      : 't_component_data',                                                  
        conditions : new sqlCondtion().where("DATA_KEY = '" + dataKey + "'").and('1=1').getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
		  	var results = resp.results;
		  	if (results && results[0]) {
		  		var blob = results[0].CONTENT;
			  	var buffer = new Buffer(blob, "utf-8");
				var content = buffer.toString();
				callback && callback(response(resObj.success, {
					content: content
				}));
		  	}
		},                                                                                 
        error : function (err) {                                                     
        	callback && callback(response(resObj.getComDataFail));                                                         
        },                                                                           
    });
    em.disconnect();
}

/**
 * Returns 根据data集合名称值获取组件数据源对象
 *
 * @param {String} dataKeys 数据源名称集合
 * @param {Function} callback 回调方法
 * @method getDatesByDataKeys
 */
var getDatesByDataKeys = function(dataKeys, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_component_data',                                                  
        conditions : new sqlCondtion().where("DATA_KEY in ( " + (function() {
        	var dataKeyStr = "";
        	for (var i = 0, len = dataKeys.length; i < len - 1; ++i) {
        		dataKeyStr += "'" + dataKeys[i] + "', ";
        	}
        	dataKeyStr += "'" + dataKeys[dataKeys.length - 1] + "'";
        	return dataKeyStr;
        })() + ")").and('1=1').getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
		  	var comDataList = resp.results;
		  	if (comDataList) {
		  		var contents = [];
		  		for (var i = 0, len = comDataList.length; i < len; ++i) {
		  			var blob = comDataList[i].CONTENT;
				  	var buffer = new Buffer(blob, "utf-8");
					var content = buffer.toString();
		  			contents.push({
		  				DATA_KEY: comDataList[i].DATA_KEY,
		  				CONTENT: content
		  			});
		  		}
				callback && callback(contents);
		  	}
		},                                                                                 
        error : function (err) {                                                     
        	callback && callback(response(resObj.getComDataFail));                                                         
        },                                                                           
    });
    em.disconnect();
}

/**
 * 增加组件数据
 *
 * @param {String} projectId 项目id
 * @param {String} comCode 组件名称
 * @param {Function} callback 回调方法
 * @method addComData
 */
var addComData = function(projectId, comCode, content, callback) {
	if (content) {
		_saveData(content, callback);
	} else {
  		var floderPath = globalConf.__base + "/prds/" + projectId + "/components/" + comCode + "/";
		if (!fs.existsSync(floderPath)) { // 判断组件是否存在
			callback && callback(response(resObj.comNotExit));
			return ;
		}
		if (!fs.existsSync(floderPath + "data.js")) { // 组件不存在 data.js 文件，返回错误
			callback && callback(response(resObj.comDataNotFound));
			return ;
		}
		var dataContent = fs.readFileSync(floderPath + "data.js", {encoding: "utf-8"});
		_saveData(dataContent, callback);
	}
}

/**
 * 更新组件数据
 *
 * @param {String} dataKey data文件名称
 * @param {Object} content 要更新内容 
 * @param {Function} callback 回调方法
 * @method updateComData
 */
var updateComData = function(dataKey, content, callback) {
	var updateParams = {                                                    
	    table  : 't_component_data',
	    keys   : ['CONTENT'],                                              
	    values : [content],                                            
	    conditions : new sqlCondtion().where("DATA_KEY = '" + dataKey + "'").getSql()    
	}; 
	em.connect();                                                                    
	em.update(updateParams, {                                       
	    success : function (data) {       
	        callback && callback(response(resObj.success));                                         
	    },                                                                  
	    error : function (err) {                                            
	        callback && callback(response(resObj.updComFail));                                               
	    }                                                                   
	});
	em.disconnect();
}

/**
 * writecom 组件写入器
 *
 * @class writecom
 * @author rahul.wu
 * @constructor
 */
module.exports = {
	getDataByDataKey: getDataByDataKey,
	getDatesByDataKeys: getDatesByDataKeys,
	addComData: addComData,
	updateComData: updateComData
}