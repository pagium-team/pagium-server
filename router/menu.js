'use strict';

var menuModule = require("../modules/menu");
var userModule = require("../modules/user");
var roleModule = require("../modules/role");
var response = require("../utils/net").response;
var resObj = require("../conf").resObj;

/**
 * node端：菜单管理
 *
 * @author baolong.zhou
 * @class pageRouter
 * @constructor
 */
module.exports = (function() {
    return function(router) {
        /**
         * 添加菜单
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.menu
         */
        router.post("/menu", function(req, res) {
            if (!req.body || !req.body.menuId || !req.body.name
                 || !req.body.icon) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var menuId = req.body.menuId;
            var parentId = req.body.parentId || null;
            var name = req.body.name;
            var icon = req.body.icon;
            var url = req.body.url || null;

            menuModule.addMenu(menuId, parentId, name, icon, url, function(resp) {
                res.send(resp);
            });
        });


        /**
         * 获取用户拥有的菜单列表
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.menuList
         */
        router.get("/menuList", function(req, res) {
            if (!req.query || !req.query.sid) {
                res.send(response(resObj.paramsError));
                return ;
            }
            if (req.query.type == 'all') {
                menuModule.getMenuList({
                    callback: function(resp) {
                        res.send(resp);
                    }
                });
            } else {
                var sid = req.query.sid;
                var userId = sid.slice(31, sid.length);   // 从sid中获取用户ID

                userModule.getMenuList({
                    userId: userId,
                    callback: function(resp) {
                        res.send(resp);
                    }
                });
            }
        });
    }
})();