'use strict';

var response = require("../utils/net").response;
var resObj = require("../conf").resObj;
var comLoader = require("../engine/loader").loadCom;
var pageWriter = require("../engine/writer").writePage; // 页面写入器 
var comModule = require("../modules/com");
var pageModule = require("../modules/page");

/**
 * node端：com 相关路由
 * 
 * @author sam.sin
 * @class comRouter
 * @constructor
 */
module.exports = (function() {
	return function(router) {
		/**
		 * 获取所有组件
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.get.coms
		 */
		router.get("/allComs", function(req, res) {
			if (!req.query || !req.query.projectId) {
				res.send(response(resObj.paramsError));
				return ;
			}
			var projectId = req.query.projectId;
			comLoader.load(projectId, function(resp) {
				res.send(resp);
			});
		});

		/**
		 * 获取所有组件
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.get.coms
		 */
		router.get("/coms", function(req, res) {
			if (!req.query || !req.query.projectId || !req.query.pageId) {
				res.send(response(resObj.paramsError));
				return ;
			}
			var projectId = req.query.projectId;
			var pageId = req.query.pageId;
			pageModule.getComsByPageId(projectId, pageId, function(resp) {
				res.send(resp);
			});
		});

		/**
		 * 获取指定组件数据
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.get.comData/dataKey
		 */
		router.get("/comData/:dataKey", function(req, res) {
			if (!req.params || !req.params.dataKey) {
				res.send(response(resObj.paramsError));
				return ;
			}
			var dataKey = req.params.dataKey;
			comModule.getDataByDataKey(dataKey, function(resp) {
				res.send(resp);
			})
		});

		/**
		 * 新增组件
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.post.com
		 */
		router.post("/com", function(req, res) {
			if (!req.body || !req.body.projectId || !req.body.pageId || !req.body.comCode) {
				res.send(response(resObj.paramsError));
				return ;
			}

			var projectId = req.body.projectId;
			var pageId = req.body.pageId;
			var comCode = req.body.comCode;

			// 增加组件 data 文件
			comModule.addComData(projectId, comCode, "", function(aComResp) {
				console.log("add component's data: " + aComResp.code + " : " + aComResp.msg);
				if (aComResp.code != resObj.success.code) {
					res.send(aComResp);
					return ;
				}

				// 添加组件
				var dataKey = aComResp.data.dataKey;
				pageModule.addComponent(pageId, comCode, dataKey, function(wPageResp) {
					console.log("page add component: " + wPageResp.code + " : " + wPageResp.msg);
					res.send(wPageResp);
				});
			});
		});

		/**
		 * 更换组件
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.put.com
		 */
		router.put("/com", function(req, res) {
			if (!req.body || !req.body.projectId || !req.body.comId || !req.body.comCode || !req.body.content) {
				res.send(response(resObj.paramsError));
				return ;
			}

			var projectId = req.body.projectId;
			var comId = req.body.comId;
			var comCode = req.body.comCode;
			var content = req.body.content;

			// 改组件
			comModule.addComData(projectId, comCode, content, function(cComRes) {
				console.log("add component: " + cComRes.code + " : " + cComRes.msg);
				if (cComRes.code != resObj.success.code) {
					res.send(cComRes);
					return ;
				}

				// 写页面
				var dataKey = cComRes.data.dataKey;
				pageModule.changeCompoment(comId, comCode, dataKey, function(resp) {
					console.log("page add component: " + resp.code + " : " + resp.msg);
					res.send(resp);
				});
			});
		});

		/**
		 * 修改组件数据
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.put.comData
		 */
		router.put("/comData", function(req, res) {
			if (!req.body || !req.body.dataKey || !req.body.content) {
				res.send(response(resObj.paramsError));
				return ;
			}
			var dataKey = req.body.dataKey;
			var content = req.body.content;
			comModule.updateComData(dataKey, content, function(resp) {
				console.log(resp.code + " : " + resp.msg);
				res.send(resp);
			});
		});

		/**
		 * 修改组件位置数据
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.put.comPosition
		 */
		router.put("/comPosition", function(req, res) {
			if (!req.body || !req.body.pageId || !req.body.comId || !req.body.toPos) {
				res.send(response(resObj.paramsError));
				return ;
			}
			var pageId = req.body.pageId;
			var comId = req.body.comId;
			var toPos = req.body.toPos;
            pageModule.changeComPos(pageId, comId, toPos, function(resp) {
            	console.log("change component position: " + resp.code + " : " + resp.msg);
            	res.send(resp);
            });
		});

		/**
		 * 删除组件数据
		 *
		 * @param {Object} req 请求头
		 * @param {Object} res 响应头 
		 * @method router.delete.com
		 */
		router.delete("/com", function(req, res) {
			console.log(req.body);
			if (!req.body || !req.body.comId) {
				res.send(response(resObj.paramsError));
				return ;
			}

			var comId = req.body.comId;

			// 写页面
			pageModule.removeCompoment(comId, function(resp) {
				console.log("remove page component " + resp.code + " : " + resp.msg);
				res.send(resp);
			});
		});
	}
})();