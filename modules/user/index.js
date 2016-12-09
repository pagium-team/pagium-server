"use strict";

/**
 * 用户管理
 *
 * @author fsiaonma
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

var menuModule = require("../menu");
var roleModule = require("../role");


/**
 * 登录
 *
 * @param {String} userName 用户名
 * @param {String} password 密码
 * @param {Function} callback 回调方法
 * @method login
 */
var login = function(userName, password, callback) {
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var md5Pass = md5.digest('hex');

    var selParams = {
        keys       : ['*'],
        table      : 't_user',
        conditions : new sqlCondtion().where("USERNAME = '" + userName + "'").and("PASSWORD = '" + md5Pass + "'").and("STATUS = 'Normal'").getSql()
    };
    em.connect();
    em.select(selParams, {
        success : function (resp) {
            var count = resp.results.length;
            if (count > 0) {
                // 在sid后面增加用户ID
                var sid = tools.uuid() + resp.results[0].ID;
                globalConf.__sessions.push({
                    sid: sid,
                    createTime: new Date().getTime()
                });
                callback && callback(response(resObj.success, {
                    sid: sid
                }));
            } else {
                callback && callback(response(resObj.loginUserNameOrPassError));
            }
        },
        error: function (err) {
            console.log(err);
            callback && callback(response(resObj.loginFail));
        },
    });
    em.disconnect();
}

/**
 * 登出
 *
 * @param {String} sid
 * @param {Function} callback 回调方法
 * @method logout
 */
var logout = function(sid, callback) {
    var sessions = globalConf.__sessions;
    for (var i = 0; i < sessions.length; ++i) {
        if (sessions[i].sid == sid) {
            globalConf.__sessions.splice(i, 1);
        }
    }
    callback && callback(response(resObj.success));
}

/**
 * 获取用户列表
 *
 * @param {Function} callback 回调方法
 * @method getUserList
 */
var getUserList = function(pageIndex, pageSize,callback) {
    var selParams = {
        keys       : ['*'],
        table      : 't_user',
        conditions : new sqlCondtion().where("STATUS = 0").limit((pageIndex - 1) * pageSize, pageSize).getSql()
    };
    em.connect();
    em.select(selParams, {
        success : function (data_user) {
            var userIds = [];
            var userList = [];
            for (var i=0,len=data_user.results.length; i<len; i++) {
                var temp = data_user.results[i];
                userList.push({
                    id: temp.ID,
                    username: temp.USERNAME,
                    status: temp.STATUS,
                    remark: temp.REMARK,
                    roles: [],
                    create_time: temp.CREATE_TIME,
                    update_time: temp.UPDATE_TIME
                });
                userIds.push(temp.ID);
            }

            getRolesList({
                userIds: userIds,
                callback: function(data_roles) {
                    for (var i=0,len=userList.length; i<len; i++) {
                        if (userList[i].id in data_roles.data.roleList) {
                            var temp = data_roles.data.roleList[userList[i].id];
                            for (var j=0,len_j=temp.length; j<len_j; j++) {
                                userList[i].roles.push(temp[j].name);
                            }
                        }
                    }
                    callback && callback(response(resObj.success, {
                        userList: userList
                    }));
                }
            });
        },
        error : function (err) {
            callback && callback(response(resObj.getUserListFail));
        }
    });
    em.disconnect();
}


/**
 * 获取某个用户信息
 *
 * @param {Function} callback 回调方法
 * @method getUserInfo
 */
var getUserInfo = function(params) {
    var selParams = {
        keys       : ['*'],
        table      : 't_user',
        conditions : new sqlCondtion().where("ID = " + params.userId).and("STATUS = 0").getSql()
    };
    em.connect();
    em.select(selParams, {
        success : function (resp) {
            if (resp.results.length > 0) {
                var temp = resp.results[0];
                var userInfo = {
                    id: temp.ID,
                    username: temp.USERNAME,
                    status: temp.STATUS,
                    remark: temp.REMARK,
                    create_time: temp.CREATE_TIME,
                    update_time: temp.UPDATE_TIME
                };
                params.callback && params.callback(response(resObj.success, {
                    userInfo: userInfo
                }));
            } else {
                params.callback && params.callback(response(resObj.userNotExist));
            }
        },
        error : function (err) {
            params.callback && params.callback(response(resObj.getUserInfoFail));
        }
    });
    em.disconnect();
}


/**
 * 添加新用户
 *
 * @param {Function} username 用户名
 * @param {Function} password 密码
 * @param {Function} remark 备注
 * @param {Function} roles 权限ID列表
 * @param {Function} callback 回调方法
 * @method addUser
 */
var addUser = function(params) {
    var username = params.username;
    var password = params.password;
    var remark = params.remark;
    var roles = JSON.parse(params.roles);
    var callback = params.callback;

    getUserList(1, 99999, function(data) {
        var userList = data.data.userList;
        var existSign = false;
        
        for (var i=0,len=userList.length; i<len; i++) {
            console.log(username, userList[i].username);
            if (username == userList[i].username) {
                existSign = true;
                break;
            }
        }
        if (!existSign) {   //  不存在该用户名
            var md5 = crypto.createHash('md5');
            md5.update(password);
            var md5Pass = md5.digest('hex');

            var insertParams = {
                table  : "t_user",
                keys   : ["USERNAME", "PASSWORD", "REMARK"],
                values : [username, md5Pass, remark]
            };
            
            em.connect();
            em.insert(insertParams, {
                success : function (data) {
                    if (roles) {
                        addRoleToUser({
                            userId: data.results.insertId,
                            roles: roles,
                            callback: function() {
                                callback && callback(response(resObj.success));
                            }
                        });
                    } else {
                        callback && callback(response(resObj.success));
                    }
                },
                error : function (err) {
                    callback && callback(response(resObj.addUserFail));
                }
            });
            em.disconnect();
        } else {
            callback && callback(response(resObj.addUserFail_usernameIsExist));
        }

    });
}


/**
 * 给用户添加角色
 *
 * @param {Function} userId 用户ID
 * @param {Function} roles 角色ID列表
 * @param {Function} callback 回调方法
 * @method addRoleToUser
 */
var addRoleToUser = function(params) {
    var userId = params.userId;
    var roles = params.roles;
    var callback = params.callback;

    var insertParams = {
        table  : "t_user_role",
        keys   : ["USER_ID", "ROLE_ID"],
        values : []
    };
    for (var i=0,len=roles.length; i<len; i++) {
        insertParams.values.push([userId, roles[i]]);
        
    }
    em.connect();
    em.insertMulti(insertParams, {
        success : function (data) {
            callback && callback(response(resObj.success));
        },
        error : function (err) {
            callback && callback(response(resObj.addProjectFail));
        }
    });
    em.disconnect();
}


/**
 * 删除用户
 *
 * @param {Function} userId 用户ID
 * @param {Function} callback 回调方法
 * @method addUser
 */
var delUser = function(params) {
    var userId = params.userId;
    var callback = params.callback;

    var updateParams = {
        table      : 't_user',
        keys       : ['STATUS'],
        values     : ['1'],
        conditions : new sqlCondtion().where("ID = " + userId).getSql()
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
 * 更改用户信息
 *
 * @param {Function} userId 用户ID
 * @param {Function} username 用户ID
 * @param {Function} password 用户密码
 * @param {Function} remark 备注
 * @param {Function} callback 回调方法
 * @method updateUser
 */
var updateUser = function(params) {
    var userId = params.userId;
    var username = params.username;
    var password = params.password;
    var remark = params.remark;
    var callback = params.callback;

    var md5 = crypto.createHash('md5');
    md5.update(password);
    var md5Pass = md5.digest('hex');

    var updateParams = {
        table      : 't_user',
        keys       : ['USERNAME', 'PASSWORD', 'REMARK'],
        values     : [username, md5Pass, remark],
        conditions : new sqlCondtion().where("ID = " + userId).getSql()
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
 * 更改用户密码
 *
 * @param {Function} userId 用户ID
 * @param {Function} password 用户密码
 * @param {Function} callback 回调方法
 * @method setPassword
 */
var setPassword = function(params) {
    var userId = params.userId;
    var password = params.password;
    var callback = params.callback;

    var md5 = crypto.createHash('md5');
    md5.update(password);
    var md5Pass = md5.digest('hex');

    var updateParams = {
        table      : 't_user',
        keys       : ['PASSWORD'],
        values     : [md5Pass],
        conditions : new sqlCondtion().where("ID = " + userId).getSql()
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
 * 获取对应用户的角色ID列表
 *
 * @param {Function} userId 用户ID
 * @param {Function} callback 回调方法
 * @method getRolesIdList
 */
var getRolesIdList = function(params) {
    var userId = params.userId;
    var callback = params.callback;

    var selParams = {
        keys       : ['ROLE_ID'],
        table      : 't_user_role',
        conditions : new sqlCondtion().where("USER_ID = " + userId).and('STATUS = 0').getSql()
    };

    em.connect();
    em.select(selParams, {
        success : function (resp) {
            var roleList = [];
            for (var i=0,len=resp.results.length; i<len; i++) {
                var temp = resp.results[i];
                roleList.push(temp.ROLE_ID);
            }
            callback && callback(response(resObj.success, {
                roleList: roleList
            }));
        },
        error : function (err) {
            callback && callback(response(resObj.getRolesFail));
        }
    });
    em.disconnect();
}


/**
 * 获取用户的角色列表
 *
 * @param {Function} userIds，用户ID列表
 * @param {Function} callback 回调方法
 * @method getRolesIdList
 */
var getRolesList = function(params) {
    var userIds = params.userIds;
    var callback = params.callback;

    roleModule.getRoleList({
        callback: function(data_role) {
            var roleMap = {};
            var roleList = data_role.data.roleList;
            for (var i=0,len=roleList.length; i<len; i++) {
                roleMap[roleList[i].id] = roleList[i];
            }

            var selParams = {
                keys       : ['USER_ID, ROLE_ID'],
                table      : 't_user_role',
                conditions : new sqlCondtion().where("USER_ID in (" + userIds.join(",") + ")").and('STATUS = 0').getSql()
            };

            em.connect();
            em.select(selParams, {
                success : function (resp) {
                    var resultList = {};

                    for (var i=0,len=resp.results.length; i<len; i++) {
                        var temp = resp.results[i];
                        
                        resultList[temp.USER_ID] = resultList[temp.USER_ID] || [];
                        resultList[temp.USER_ID].push(roleMap[temp.ROLE_ID]);
                    }
                    callback && callback(response(resObj.success, {
                        roleList: resultList
                    }));
                },
                error : function (err) {
                    callback && callback(response(resObj.getRolesFail));
                }
            });
            em.disconnect();
        }
    });
}


/**
 * 获取用户所属角色的权限菜单列表
 *
 * @param {String} userId 用户ID
 * @param {Function} callback 回调方法
 * @method getMenuList
 */
var getMenuList = function(params) {
    var userId = params.userId;
    var callback = params.callback;

    getRolesIdList({
        userId: userId,
        callback: function(resp) {
            var roles = resp.data.roleList;

            var selParams = {
                keys       : ['*'],
                table      : 't_menu',
                conditions : new sqlCondtion().where("ID IN (SELECT MENU_ID FROM t_menu_role WHERE ROLE_ID in ('" + roles.join("','") + "') and STATUS=0)").and("STATUS=0").getSql()
            };
            em.connect();
            em.select(selParams, {
                success : function (resp) {
                    callback && callback(response(resObj.success, {
                        menuList: menuModule.parseMenuListFromSqlQuery(resp.results)
                    }));
                },
                error: function (err) {
                    console.log(err);
                    callback && callback(response(resObj.loginFail));
                },
            });
            em.disconnect();
        }
    });
}


/**
 * user 用户模块
 * @class user
 * @author fsiaonma
 * @constructor
 */
module.exports = {
    login: login,
    logout: logout,
    getUserList: getUserList,
    addUser: addUser,
    delUser: delUser,
    updateUser: updateUser,
    setPassword: setPassword,
    getRolesIdList: getRolesIdList,
    getMenuList: getMenuList,
    getUserInfo: getUserInfo
}
