'use strict';
var roleModule = require("../modules/role");
var response = require("../utils/net").response;
var resObj = require("../conf").resObj;

/**
 * node端：角色相关
 *
 * @author baolong.zhou
 * @class pageRouter
 * @constructor
 */
module.exports = (function() {
    return function(router) {

        /**
         * 添加角色
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.role
         */
        router.post("/role", function(req, res) {
            if (!req.body || !req.body.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var name = req.body.name;
            var common = req.body.common;
            roleModule.addRole({
                name: name,
                common: common,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });


        /**
         * 获取某个角色信息
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.role
         */
        router.get("/role", function(req, res) {
            if (!req.query || !req.query.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var sid = req.query.sid;
            userModule.logout(sid, function(resp) {
                res.send(resp);
            });
        });


        /**
         * 删除角色
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.role
         */
        router.delete("/role", function(req, res) {
            if (!req.body || !req.body.sid || !req.body.roleId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var sid = req.body.sid;
            roleModule.delRole({
                roleId: req.body.roleId,
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });


        /**
         * 获取角色列表
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.roles
         */
        router.get("/roleList", function(req, res) {
            if (!req.query || !req.query.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var sid = req.query.sid;
            roleModule.getRoleList({
                callback: function(resp) {
                    res.send(resp);
                }
            });
        });
    }
})();