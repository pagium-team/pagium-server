'use strict';

var userModule = require("../modules/user");
var response = require("../utils/net").response;
var resObj = require("../conf").resObj;

/**
 * node端：上传文件
 *
 * @author sam.sin
 * @class pageRouter
 * @constructor
 */
module.exports = (function() {
    return function(router) {
        /**
         * 登录
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.login
         */
        router.post("/login", function(req, res) {
            if (!req.body || !req.body.userName || !req.body.password) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var userName = req.body.userName;
            var password = req.body.password;
            userModule.login(userName, password, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 登出
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.logout
         */
        router.post("/logout", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var sid = req.body.sid;
            userModule.logout(sid, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 获取用户列表
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.userList
         */
        router.get("/userList", function(req, res) {
            if (!req.query || !req.query.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var pageIndex = req.query.pageIndex || 1;
            var pageSize = req.query.pageSize || 20;

            var sid = req.query.sid;
            userModule.getUserList(pageIndex, pageSize, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 新增用户
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.user
         */
        router.post("/user", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            var password = null;
            if (req.body.password1 == req.body.password2) {
                password = req.body.password1;
            }
            if (password) {
                userModule.addUser({
                    username: req.body.username,
                    password: password,
                    roles: req.body.roles,
                    remark: req.body.remark,
                    callback: function(resp) {
                        res.send(resp);
                    }
                });
            } else {
                res.send(response(resObj.paramsError));
            }
        });

        /**
         * 删除用户
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.delete.user
         */
        router.delete("/user", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            userModule.delUser({
                userId: req.body.userId,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });

        /**
         * 更新用户信息
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.put.user
         */
        router.put("/user", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            userModule.updateUser({
                userId: req.body.userId,
                username: req.body.username,
                password: req.body.password,
                remark: req.body.remark,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });

        /**
         * 获取某个用户信息
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.user
         */
        router.get("/user", function(req, res) {
            if (!req.query || !req.query.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            userModule.getUserInfo({
                userId: req.query.userId,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });

        /**
         * 更改用户密码
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.put.userPasswd
         */
        router.put("/userPasswd", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            var sid = req.body.sid;
            var userId = sid.slice(31, sid.length);
            userModule.setPassword({
                userId: userId,
                password: req.body.password,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });
    }
})();