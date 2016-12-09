'use strict';

var tools = require("../../utils/tools");
var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var comLoader = require("../../engine/loader").loadCom;
var em = require("../../libs/eagle-mysql/eagleMysql");
var sqlCondtion = require("../../libs/eagle-mysql/sqlCondition");
var fs = require("fs"); // 文件读写模块
var globalConf = require("../../global"); // 全局变量
var comModule = require("../../modules/com");

/**
 * 获取指定页面最后组件位置
 *
 * @param {String} pageId 页面id
 * @param {Function} callback 回调方法
 * @method _getLastPos
 */
var _getLastPos = function(pageId, callback) {
	var position = 100; // 组件位置
	em.connect();                                                                   
    em.excute("select max(POSITION) from t_page_component where PAGE_ID = '" + pageId + "' and STATUS = 'Normal'", {                                                   
        success : function (resp) {
        	if (resp.results[0] && resp.results[0]["max(POSITION)"]) {
        		position = resp.results[0]["max(POSITION)"] + 100;
        	}
        	callback && callback(position);
		},                                                                                 
        error : function (err) {                                                     
        	callback && callback(-1);                                               
        }                                                                           
    });
    em.disconnect();
}

/**
 * 添加组件
 *
 * @param {String} pageId 页面id
 * @param {Object} comCode 组件键值
 * @param {String} dataKey 组件数据键值
 * @param {Function} callback 回调方法
 * @method addComponent
 */
var addComponent = function(pageId, comCode, dataKey, callback) {
	_getLastPos(pageId, function(comPos) {
		if (comPos == -1) {
			callback && callback(response(resObj.addComFail));
			return ;
		}
		var insertParams = {                             
			table  : "t_page_component",                      
			keys   : [
				"PAGE_ID", 
				"CODE", 
				"DATA_KEY", 
				"POSITION",
				"STATUS"
			],                       
			values : [
				pageId,
				comCode, 
				dataKey,
				comPos,
				"Normal"
			]                        
		};   
		em.connect();                                            
		em.insert(insertParams, {                
			success : function (data) {
				callback && callback(response(resObj.success));
			},                                           
			error : function (err) {       
				console.log(err);              
				callback && callback(response(resObj.addComFail));                   
			}                                            
		});
		em.disconnect();
	});
}

/**
 * 删除组件
 *
 * @param {String} comId 组件id
 * @param {Function} callback 回调方法
 * @method removeCompoment
 */
var removeCompoment = function(comId, callback) {
	var updateParams = {                                                    
	    table  : 't_page_component',
	    keys   : ['STATUS'],                                              
	    values : ['DELETE'],                                            
	    conditions : new sqlCondtion().where("ID = '" + comId + "'").getSql()    
	}; 
	em.connect();                                                                    
	em.update(updateParams, {                                       
	    success : function (data) {
	        callback && callback(response(resObj.success));                                         
	    },                                                                  
	    error : function (err) {                                            
	        callback && callback(response(resObj.delComFial));                                               
	    }                                                                   
	});
	em.disconnect();
}

/**
 * 更改组件
 *
 * @param {String} comId 组件id
 * @param {Object} comCode 组件键值
 * @param {Object} dataKey 组件数据键值
 * @param {Object} callback 回调方法
 * @method changeCompoment
 */
var changeCompoment = function(comId, comCode, dataKey, callback) {
	var updateParams = {                                                    
	    table  : 't_page_component',
	    keys   : ['CODE', 'DATA_KEY'],                                              
	    values : [comCode, dataKey],                                            
	    conditions : new sqlCondtion().where("ID = '" + comId + "'").getSql()    
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
 * 更改组件位置
 *
 * @param {Number} pageId 页面 id
 * @param {Object} comId 组件id
 * @param {Object} toPos 需要调整到的目标位置
 * @param {Function} callback 回调方法
 * @method changeComPos
 */
var changeComPos = function(pageId, comId, toPos, callback) {
	var selSql = "select count(*) from t_page_component where PAGE_ID = " + pageId + " and POSITION = " + toPos + " and STATUS = 'Normal'";
	em.connect();      
 	em.excute(selSql, {
 		success : function (resp) {
 			if (resp.results[0]["count(*)"] > 0) {
 				callback && callback(response(resObj.updComPosExist));
 				return ;
 			} else {
 				var updateParams = {                                                    
				    table  : 't_page_component',
				    keys   : ['POSITION'],                                              
				    values : [toPos],                                            
				    conditions : new sqlCondtion().where("ID = '" + comId + "'").getSql()    
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
		},                                                                                 
        error : function (err) {   
        	callback && callback(response(resObj.updComFail));                                               
        }                                                                           
    });
    em.disconnect();
};

/**
 * 获取页面所有组件
 *
 * @param {String} projectId 项目id
 * @param {String} pageId 页面id
 * @param {Function} callback 回调方法
 * @method getComsByPageId
 */
var getComsByPageId = function(projectId, pageId, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_page_component',                                                  
        conditions : new sqlCondtion().where("PAGE_ID = '" + pageId + "'").and("STATUS = 'Normal'").and('1=1').orderBy("POSITION", "ASC").getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
        	if (resp.results) {
        		var resComs = [];
        		for (var i = 0; i < resp.results.length; ++i) {
        			var res = resp.results[i];
        			resComs.push({
        				id: res.ID,
        				code: res.CODE,
        				pos: res.POSITION,
        				dataKey: res.DATA_KEY
        			});
        		}

        		var components = [];
	        	comLoader.load(projectId, function(resp) {
	        		var comList = resp.data.comList;
	        		// 获取中文名
	        		for (var i = 0; i < resComs.length; ++i) {
						for (var j = 0; j < comList.length; ++j) {
							if (resComs[i].code == comList[j].code) {
								resComs[i].name = comList[j].name;
								break ;
							}
						}
					}
					
					callback && callback(response(resObj.success, resComs));
				});
        	} else {
        		callback && callback(response(resObj.getComsFail));
        	}
		},                                                                                 
        error : function (err) {                                                     
            callback && callback(response(resObj.getComsFail));                                                        
        },                                                                           
    });
    em.disconnect();
}

/**
 * 获取页面所有组件
 *
 * @param {String} pageIds 页面id集合
 * @param {Function} callback 回调方法
 * @method getComsByPages
 */
var getComsByPages = function(pageIds, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_page_component',                                                  
        conditions : new sqlCondtion().where("PAGE_ID in (" + (function() {
        	var pagesIdsStr = "";
        	for (var i = 0, len = pageIds.length; i < len - 1; ++i) {
        		pagesIdsStr += "'" + pageIds[i] + "', ";
        	}
        	pagesIdsStr += "'" + pageIds[pageIds.length - 1] + "'";
        	return pagesIdsStr;
        })() + ") ").and("STATUS = 'Normal'").and('1=1').orderBy("POSITION", "ASC").getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
        	if (resp.results) {
        		var resComs = resp.results;
				callback && callback(response(resObj.success, resComs));
        	} else {
        		callback && callback(response(resObj.getComsFail));
        	}
		},                                                                                 
        error : function (err) {                                                     
            callback && callback(response(resObj.getComsFail));                                                        
        },                                                                           
    });
    em.disconnect();
}

/**
 * 添加页面
 *
 * @param {Object} params 添加参数
 * @param {Function} callback 回调方法
 * @method addPage
 */
var addPage = function(params, callback) {
	var projectId = params.projectId;
	var pageName = params.name;
	var pageDesc = params.desc;
	var pageTitle = params.title;
	var pageMeta = params.meta;
	var pageType = params.type;

	var tplName;
    if (pageType == "pc") {
        tplName = "pcTpl";
    } else if (pageType == "wap") {
        tplName = "wapTpl";
    }

	var insertParams = {                             
		table  : "t_page",                      
		keys   : [
			"PROJECT_ID", 
			"NAME", 
			"DESCRIPTION", 
			"TITLE", 
			"META",
			"TPL_NAME",
			"TYPE",
			"STATUS"
		],                       
		values : [
			projectId, 
			pageName,
			pageDesc,
			pageTitle,
			pageMeta,
			tplName,
			pageType,
			'Normal'
		]                        
	};   
	em.connect();                                            
	em.insert(insertParams, {                
		success : function (data) {
			callback && callback(response(resObj.success, {
				results: data.results
			}));
		},                                           
		error : function (err) {       
			console.log(err);              
			callback && callback(response(resObj.addPageFail));                   
		}                                            
	});
	em.disconnect();
}

/**
 * 更新页面
 *
 * @param {Object} params 添加参数
 * @param {Function} callback 回调方法
 * @method updatePage
 */
var updatePage = function(params, callback) {
	var pageId = params.pageId;
	var pageName = params.name;
	var pageDesc = params.desc;
	var pageTitle = params.title;
	var pageMeta = params.meta;
	var pageType = params.type;

	var updateParams = {                                                    
	    table  : 't_page',
	    keys   : [
			"NAME", 
			"DESCRIPTION", 
			"TITLE", 
			"META",
			"TYPE"
		],                       
		values : [
			pageName,
			pageDesc,
			pageTitle,
			pageMeta,
			pageType
		],                                      
	    conditions : new sqlCondtion().where("ID = '" + pageId + "'").getSql()    
	}; 
	em.connect();                                                                    
	em.update(updateParams, {                                       
	    success : function (data) {
	        callback && callback(response(resObj.success));                                         
	    },                                                                  
	    error : function (err) {                                            
	        callback && callback(response(resObj.updatePageFail));                                               
	    }                                                                   
	});
	em.disconnect();
}

/**
 * 获取所有页面
 *
 * @param {Number} projectId 项目 id
 * @param {Function} callback 回调方法
 * @method getPageListByProjectId
 */
var getPageListByProjectId = function(projectId, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_page',                                                  
        conditions : new sqlCondtion().where("PROJECT_ID = '" + projectId + "'").and("STATUS = 'Normal'").and('1=1').orderBy("ID", "DESC").getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
        	var results = resp.results;
        	if (results) {
        		var pageList = {
        			pc: [],
        			wap: []
        		};

        		for (var i = 0, len = results.length; i < len; ++i) {
        			var pageObj = {};

        			pageObj.id = results[i].ID;

        			pageObj.name = results[i].NAME;
        			pageObj.desc = results[i].DESCRIPTION;
        			pageObj.title = results[i].TITLE;

					if (results[i].TYPE == "pc") {
						pageList.pc.push(pageObj);
					} else if (results[i].TYPE == "wap") {
						pageList.wap.push(pageObj);
					}
        		}

				callback && callback(response(resObj.success, {
					pageList: pageList
				}));
        	} else {
        		callback && callback(response(resObj.getPageListFail));
        	}
		},                                                                                 
        error : function (err) {                                                     
            callback && callback(response(resObj.getPageListFail));                                                        
        },                                                                           
    });
    em.disconnect();
}

/**
 * 获取页面信息
 *
 * @param {Number} pageId 页面 id
 * @param {Function} callback 回调方法
 * @method getPageDetailByPageIds
 */
var getPageDetailByPageIds = function(pageIds, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_page',                                                  
        conditions : new sqlCondtion().where("ID in (" + (function() {
        	var pageIdsStr = "";
        	for (var i = 0, len = pageIds.length; i < len - 1; ++i) {
        		pageIdsStr += "'" + pageIds[i] + "', ";
        	}
        	pageIdsStr += "'" + pageIds[pageIds.length - 1] + "'";
        	return pageIdsStr;
        })() + ")").and("STATUS = 'Normal'").getSql()
    };            
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
        	var results = resp.results;
        	if (results) {
        		var pageList = [];
        		for (var i = 0, len = results.length; i < len; ++i) {
        			var pageObj = {};

	    			pageObj.id = results[i].ID;

	    			pageObj.name = results[i].NAME;
	    			pageObj.desc = results[i].DESCRIPTION;
	    			pageObj.title = results[i].TITLE;

	    			var metaBlob = results[i].META;
				  	var metaBuffer = new Buffer(metaBlob, "utf-8");
					pageObj.meta = metaBuffer.toString();

					pageObj.tplName = results[i].TPL_NAME;
					pageObj.type = results[i].TYPE;

					pageList.push(pageObj);
        		}
				callback && callback(response(resObj.success, pageList));
        	} else {
        		callback && callback(response(resObj.getPageDetailFail));
        	}
		},                                                                                 
        error : function (err) {                                                     
            callback && callback(response(resObj.getPageDetailFail));                                                        
        },                                                                           
    });
    em.disconnect();
}


/**
 * 复制页面
 *
 * @param {Object} params 添加参数
 * @param {Function} callback 回调方法
 * @method copyPage
 */
var copyPage = function(params, callback) {
	var projectId = params.projectId;
	var pageId = params.pageId;
	var name = params.name;
    var desc = params.desc;
    var title = params.title;
    var type = params.type;
    var meta = params.meta;

	addPage({
		projectId: projectId,
		name: name,
		desc: desc,
		title: title,
		meta: meta,
		type: type
	}, function(addResp) {
		var newPageId = addResp.data.results.insertId;
		getComsByPages([pageId], function(comsResp) {

			var dataKeys = [];
			for (var i=0,len=comsResp.data.length; i<len; i++) {
				dataKeys.push(comsResp.data[i].DATA_KEY);
			}
			comModule.getDatesByDataKeys(dataKeys, function(comDatasResp) {
				copyComs(projectId, newPageId, comsResp, comDatasResp, function(copyComResp) {
					callback && callback(copyComResp);
				});
			});
		});
	});

	function copyComs(projectId, pageId, comsResp, comDatasResp, callback) {
		var comList = comsResp.data;
		var comDatas = {};

		for (var i=0,len=comDatasResp.length; i<len; i++) {
			comDatas[comDatasResp[i].DATA_KEY] = comDatasResp[i].CONTENT;
		}

		for (var i=0,len=comList.length; i<len; i++) {
			comList[i]['CONTENT'] = comDatas[comList[i].DATA_KEY];
			comList[i].DATA_KEY = "data-" + tools.uuid();
		}
		var insertParams = {                             
			table  : "t_component_data",                      
			keys   : ["DATA_KEY", "CONTENT"],                       
			values : []
		}; 
		for (var i=0,len=comList.length; i<len; i++) {
			insertParams.values.push([comList[i].DATA_KEY, comList[i].CONTENT]);
		}

		em.connect();                                              
		em.insertMulti(insertParams, {                
			success : function (insertComdataResp) {
				var insertParams = {                             
					table  : "t_page_component",                      
					keys   : ["PAGE_ID", "CODE", "DATA_KEY", "POSITION", "STATUS"],
					values : []
				}; 
				for (var i=0,len=comList.length; i<len; i++) {
					insertParams.values.push([pageId, comList[i].CODE, comList[i].DATA_KEY, comList[i].POSITION, comList[i].STATUS]);
				}
				em.connect();                                            
				em.insertMulti(insertParams, {                
					success : function (insertComsResp) {
						callback && callback(response(resObj.success));
					},                                           
					error : function (err) {       
						console.log(err);              
						callback && callback(response(resObj.addComFail));                   
					}                                            
				});
			},                                           
			error : function (err) {                     
				callback && callback(response(resObj.addComFail));                   
			}                                            
		});
		em.disconnect();
	}
}


/**
 * page 页面模块
 *
 * @class pageModule
 * @author sam.sin
 * @constructor
 */
module.exports = {
	getComsByPageId: getComsByPageId,
	addComponent: addComponent,
	removeCompoment: removeCompoment,
	changeCompoment: changeCompoment,
	changeComPos: changeComPos,
	getComsByPages: getComsByPages,
	addPage: addPage,
	copyPage: copyPage,
	updatePage: updatePage,
	getPageListByProjectId: getPageListByProjectId,
	getPageDetailByPageIds: getPageDetailByPageIds
}

// var dbConf = require("../../conf").dbConf;
// em.init(dbConf);
// var fs = require("fs"); // 文件读写模块
// var globalConf = require("../../global"); // 全局变量

// var ids = [];
// for (var i = 1; i < 55; ++i) {
// 	ids.push(i);
// }

// getPageDetailByPageIds(ids, function(resp) {
// 	for (var i = 0; i < resp.data.length; ++i) {
// 		if (resp.data[i].content.indexOf("jssor.slider.min.js") > -1) {
// 			console.log(resp.data[i].name, resp.data[i].desc, "slider");
// 		}
// 		if (resp.data[i].content.indexOf("swiper.min.js") > -1) {
// 			console.log(resp.data[i].name, resp.data[i].desc, "swiper");
// 		}
// 	}
// });

// var updateParams = {                             
// 	table  : "t_page",                      
// 	keys   : [
// 		"META",
// 	],                       
// 	values : [
// 		'<meta name="description" content="Enjoy huge discount during VIPme black friday deals week. Shop for designer dresses, tops, outerwears, shoes. Free Shipping, up to 50% off & extra $50 off!"/>'
// 	],
// 	conditions : new sqlCondtion().where("ID = 22").getSql()                        
// };   
// em.connect();                                            
// em.update(updateParams, {                
// 	success : function (data) {
// 		console.log("success");
// 	},                                           
// 	error : function (err) {       
// 		console.log("error");           
// 	}                                            
// });
// em.disconnect();


// addPage({
// 	projectId: 1,
// 	name: "facebook-products",
// 	desc: "facebook products",
// 	title: "facebook products",
// 	type: "pc",
// 	meta: "",
// 	content: fs.readFileSync(globalConf.__base + "/prds/1/views/templates/pcFacebookTpl.html", "utf-8")
// });

// addPage({
// 	projectId: 1,
// 	name: "m-vipme-insider-selection",
// 	desc: "红人页活动页 移动端",
// 	title: "VIPme | VIPme Insider Selection",
// 	type: "wap",
// 	meta: "", 
// 	content: fs.readFileSync(globalConf.__base + "/prds/1/views/templates/wapSliderTpl.html", "utf-8")
// });


