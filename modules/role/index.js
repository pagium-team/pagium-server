"use strict";

/**
 * 用户管理
 *
 * @author baolong.zhou
 * @module user.js
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
 * 添加新角色
 *
 * @param {Function} username 当前页码
 * @param {Function} password 每页条数
 * @param {Function} commom 备注
 * @param {Function} callback 回调方法
 * @method addRole
 */
var addRole = function(params) {
    var name = params.name;
    var commom = params.commom;
    var callback = params.callback;

    var insertParams = {
        table  : "t_role",
        keys   : ["NAME", "COMMENT"],
        values : [name, commom]
    };
    em.connect();
    em.insert(insertParams, {
        success : function (data) {
            callback && callback(response(resObj.success));
        },
        error : function (err) {
            callback && callback(response(resObj.addRoleFail));
        }
    });
    em.disconnect();
}


/**
 * 更改角色信息
 *
 * @param {Function} name 角色ID
 * @param {Function} name 角色名
 * @param {Function} commom 角色备注
 * @param {Function} callback 回调方法
 * @method updateRole
 */
var updateRole = function(params) {
	var roleId = params.id;
    var name = params.name;
    var commom = params.commom;
    var callback = params.callback;

    var updateParams = {
        table      : 't_role',
        keys       : ['NAME', 'COMMENT'],
        values     : [name, commom],
        conditions : new sqlCondtion().where("ID = " + roleId).getSql()
    };
    em.connect();
    em.update(updateParams, {
        success : function (data) {
            callback && callback(response(resObj.success));
        },
        error : function (err) {
            callback && callback(response(resObj.updateRoleFail));
        }
    });
    em.disconnect();
}


/**
 * 删除角色
 *
 * @param {Function} roleId 角色ID
 * @param {Function} callback 回调方法
 * @method delRole
 */
var delRole = function(params) {
    var roleId = params.roleId;
    var callback = params.callback;

    var updateParams = {
        table      : 't_role',
        keys       : ['STATUS'],
        values     : ['1'],
        conditions : new sqlCondtion().where("ID = " + roleId).getSql()
    };
    em.connect();
    em.update(updateParams, {
        success : function (data) {
            callback && callback(response(resObj.success));
        },
        error : function (err) {
            callback && callback(response(resObj.delUserFail));
        }
    });
    em.disconnect();
}


/**
 * 获取角色列表
 *
 * @param {Function} callback 回调方法
 * @method getRoleList
 */
var getRoleList = function(params) {
    var callback = params.callback;
    var pageIndex = params.pageIndex || 1;
    var pageSize = params.pageSize || 200;

    var selParams = {
        keys       : ['*'],
        table      : 't_role',
        conditions : new sqlCondtion().where("STATUS = 0").limit((pageIndex - 1) * pageSize, pageSize).getSql()
    };
    em.connect();
    em.select(selParams, {
        success : function (data) {
            var roleList = [];
            for (var i=0,len=data.results.length; i<len; i++) {
                var temp = data.results[i];
                roleList.push({
                    id: temp.ID,
                    name: temp.NAME,
                    comment: temp.COMMENT,
                    status: temp.STATUS,
                    create_time: temp.CREATE_TIME,
                    update_time: temp.UPDATE_TIME
                });
            }
            callback && callback(response(resObj.success, {
                roleList: roleList
            }));
        },
        error : function (err) {
            callback && callback(response(resObj.getRoleListFail));
        }
    });
    em.disconnect();
}

/**
 * role 角色模块
 * @class role
 * @author baolong.zhou
 * @constructor
 */
module.exports = {
	addRole: addRole,
	updateRole: updateRole,
    delRole: delRole,
    getRoleList: getRoleList
}
