"use strict";

/**
 * 菜单管理管理
 *
 * @author baolong.zhou
 * @module menu.js
 * @constructor
 */
var crypto = require('crypto');

var globalConf = require("../../global"); // 全局变量
var em = require("../../libs/eagle-mysql/eagleMysql");
var sqlCondtion = require("../../libs/eagle-mysql/sqlCondition");
var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var tools = require("../../utils/tools");

/**
 * 添加菜单
 *
 * @param {String} menuId 菜单ID
 * @param {String} parentId 父级菜单ID
 * @param {String} name 菜单名
 * @param {String} icon 菜单ICON
 * @param {String} url 菜单URL
 * @param {Function} callback 回调方法
 * @method addProject
 */
var addMenu = function(menuId, parentId, name, icon, url, callback) {
    var insertParams = {                             
        table  : "t_menu",                      
        keys   : ["MENU_ID", "PARENT_ID", "NAME", "ICON", "URL"],                       
        values : [menuId, parentId, name, icon, url]
    };       
    em.connect();                                        
    em.insert(insertParams, {                
        success : function (data) {
            callback && callback(response(resObj.success));               
        },                                           
        error : function (err) {                     
            callback && callback(response(resObj.addMenuFail));                   
        }                                          
    });
    em.connect(); 
}


/**
 * 获取菜单列表
 *
 * @param {Function} callback 回调方法
 * @method getMenuList
 */
var getMenuList = function(params) {
    var insertParams = {                             
        keys       : ['*'],                                                   
        table      : 't_menu',                                                  
        conditions : new sqlCondtion().where("STATUS=0").orderBy("ID", "ASC").getSql()
    };           
    em.connect();                                        
    em.select(insertParams, {                
        success : function (data) {
            params.callback && params.callback(response(resObj.success, {
                menuList: parseMenuListFromSqlQuery(data.results)
            }));               
        },                                           
        error : function (err) {                     
            params.callback && params.callback(response(resObj.addMenuFail));                   
        }                                          
    });
    em.connect(); 
}


/**
 * 将SQL查询结果解析成API返回格式
 *
 * @param {List} datas SQL返回结果集
 * @method parseMenuListFromSqlQuery
 */
var parseMenuListFromSqlQuery = function(datas) {
    var menuMap = {};
    var childList = [];
    var menuList = [];
    for (var i=0,len=datas.length; i<len; i++) {
        var temp = datas[i];
        var menu = {
            id: temp.ID,
            key: temp.MENU_ID,
            name: temp.NAME,
            hasChild: false,
            icon: temp.ICON,
            url: temp.URL,
            parentId: temp.PARENT_ID,
            isNew: false,
            isAct: null,
            children: []
        }
        
        if (!menu.parentId) {
            menuMap[menu.id] = menu;
        } else {
            childList.push(menu);
        }
    }
    for (var i=0,len=childList.length; i<len; i++) {
        var temp = childList[i];
        if (menuMap[temp.parentId]) {
            menuMap[temp.parentId].children.push(temp);
            menuMap[temp.parentId].hasChild = true;
        }
    }
    for (var temp in menuMap) {
        menuList.push(menuMap[temp]);
    }
    return menuList;
}

/**
 * user 菜单模块
 * @class menu
 * @author baolong.zhou
 * @constructor
 */
module.exports = {
    addMenu: addMenu,
    getMenuList: getMenuList,
    parseMenuListFromSqlQuery: parseMenuListFromSqlQuery
}
