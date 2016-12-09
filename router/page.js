'use strict';

var response = require("../utils/net").response;
var resObj = require("../conf").resObj;
var commander = require("../engine/commander");
var loader = require("../engine/loader");
var publisher = require("../engine/publisher");
var pageModule = require("../modules/page");

/**
 * node端：page 相关路由
 *
 * @author sam.sin
 * @class pageRouter
 * @constructor
 */
module.exports = (function() {
    return function(router) {
        /**
         * 获取页面信息
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.pageInfo
         */
        router.get("/pageInfo", function(req, res) {
            if (!req.query || !req.query.pageId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var pageId = req.query.pageId;
            pageModule.getPageDetailByPageIds([pageId], function(resp) {
                res.send(resp);
            });
        });

        /**
         * 获取页面列表
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.pages
         */
        router.get("/pages", function(req, res) {
            if (!req.query || !req.query.projectId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectId = req.query.projectId;
            pageModule.getPageListByProjectId(projectId, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 预览页面
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.prePage
         */
        router.get("/prePage", function(req, res) {
            if (!req.query || !req.query.projectId || !req.query.pageId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectId = req.query.projectId;
            var pageId = req.query.pageId;
            commander.builder.preview(projectId, pageId, function(resp) { // 成功回调
                res.send(response(resObj.success, resp));
            }, function() { // 失败回调
                res.send(response(resObj.pulishPageFail));
            });
        });

        /**
         * 保存页面
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.page
         */
        router.get("/page", function(req, res) {
            if (!req.query || !req.query.projectId || !req.query.pageId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectId = req.query.projectId;
            var pageId = req.query.pageId;
            commander.builder.build(projectId, pageId, function(resp) { // 成功回调
                res.send(response(resObj.success, resp));
            }, function() { // 失败回调
                res.send(response(resObj.pulishPageFail));
            });
        });

        /**
         * 发布页面到线上
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.onlinePage
         */
        router.post("/onlinePage", function(req, res) {
            if (!req.body || !req.body.projectId || !req.body.pageId) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectId = req.body.projectId;
            var pageId = req.body.pageId;

            pageModule.getPageDetailByPageIds([pageId], function(resp) {
                if (resp && resp.data && resp.data[0] && resp.data[0].name) {
                    publisher.poam.pushPage(projectId, resp.data[0].name, function(resp) {
                        res.send(resp);
                    });
                }
                
            });
            
        });

        /**
         * 添加页面
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.page
         */
        router.post("/page", function(req, res) {
            if (!req.body || !req.body.projectId || !req.body.pageName || !req.body.pageDesc || !req.body.pageTitle || !req.body.pageType) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectId = req.body.projectId;
            var pageName = req.body.pageName;
            var pageDesc = req.body.pageDesc;
            var pageTitle = req.body.pageTitle;
            var pageType = req.body.pageType;
            var pageMeta = req.body.pageMeta;

            pageModule.addPage({
                projectId: projectId,
                name: pageName,
                desc: pageDesc,
                title: pageTitle,
                type: pageType,
                meta: pageMeta
            }, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 复制页面
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.copyPage
         */
        router.post("/copyPage", function(req, res) {
            if (!req.body || !req.body.pageId || !req.body.projectId || !req.body.pageName || !req.body.pageDesc || !req.body.pageTitle || !req.body.pageType) {
                res.send(response(resObj.paramsError));
                return ;
            }
            var projectId = req.body.projectId;
            var pageId = req.body.pageId;
            var pageName = req.body.pageName;
            var pageDesc = req.body.pageDesc;
            var pageTitle = req.body.pageTitle;
            var pageMeta = req.body.pageMeta;
            var pageType = req.body.pageType;
            pageModule.copyPage({
                pageId: pageId,
                projectId: projectId,
                name: pageName,
                desc: pageDesc,
                title: pageTitle,
                type: pageType,
                meta: pageMeta
            }, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 修改页面
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.option.put
         */
        router.put("/page", function(req, res) {
            if (!req.body || !req.body.pageId || !req.body.pageName || !req.body.pageDesc || !req.body.pageTitle || !req.body.pageType) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var pageId = req.body.pageId;
            var pageName = req.body.pageName;
            var pageDesc = req.body.pageDesc;
            var pageTitle = req.body.pageTitle;
            var pageType = req.body.pageType;
            var pageMeta = req.body.pageMeta;

            pageModule.updatePage({
                pageId: pageId,
                name: pageName,
                desc: pageDesc,
                title: pageTitle,
                type: pageType,
                meta: pageMeta
            }, function(resp) {
                res.send(resp);
            });
        });
    }
})();