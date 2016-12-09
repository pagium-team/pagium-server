'use strict';

var formidable = require("formidable");

var projectModule = require("../modules/project");
var response = require("../utils/net").response;
var resObj = require("../conf").resObj;
var globalConf = require("../global"); // 全局变量

var checkSid = function(sid) {
    var flag = false;
    var sessions = globalConf.__sessions;
    for (var i = 0; i < sessions.length; ++i) {
        var session = sessions[i];
        if (session.sid == sid && new Date().getTime() - session.createTime < globalConf.__sessionDelay) {
            flag = true;
        }
    }
    return flag;
}

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
         * 新增项目
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.project
         */
        router.post("/project", function(req, res) {
            if (!req.body || !req.body.projectName || !req.body.projectDesc) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var projectName = req.body.projectName;
            var projectDesc = req.body.projectDesc;
            projectModule.addProject(projectName, projectDesc, function(resp) {
                res.send(resp);
            });
        });

        /**
         * 上传项目文件
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.post.projectFile
         */
        router.post("/projectFile", function(req, res) {
            var form = new formidable.IncomingForm();   //创建上传表单
            form.encoding = 'utf-8';        //设置编辑
            form.keepExtensions = true;  //保留后缀

            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log(err);
                    res.send(response(resObj.uploadProjectFileFail));
                    return ;
                }

                if (!fields.sid) {
                    res.send(response(resObj.sidDisable));
                    return ;
                }

                if (!checkSid(fields.sid)) {
                    res.send(response(resObj.sidDisable));
                    return ;
                }

                if (!fields || !fields.projectId || !files || !files.projectFile) {
                    res.send(response(resObj.paramsError));
                    return ;
                }

                var projectId = fields.projectId;
                projectModule.uploadProjectFile(projectId, files, function(resp) {
                    res.send(resp);
                });
            });
        });

        /**
         * 获取所有项目
         *
         * @param {Object} req 请求头
         * @param {Object} res 响应头 
         * @method router.get.allProjects
         */
        router.get("/projectList", function(req, res) {
            if (!req.query || !req.query.pageIndex || !req.query.pageSize) {
                res.send(response(resObj.paramsError));
                return ;
            }

            var pageIndex = req.query.pageIndex;
            var pageSize = req.query.pageSize;
            projectModule.getProjectList(pageIndex, pageSize, function(resp) {
                res.send(resp);
            })
        });
    }
})();