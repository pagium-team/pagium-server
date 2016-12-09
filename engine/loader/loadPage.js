'use strict';

var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var walk = require("walk"); // 爬虫器
var fs = require("fs"); // 文件操作模块
var globalConf  = require("../../global"); // 全局变量
var allPages = {}; // 所有页面缓存数据
var projectModule = require("../../modules/project");

/**
 * 执行页面解析
 *
 * @param {Number} projectId 项目id
 * @param {String} projectName 项目名称
 * @param {Function} callback 回调方法
 * @method _getRealPages
 */
var _getRealPages = function(projectId, projectName, callback) {
    var pageList = { // 页面数据列表
        pc: [],
        wap: [],
        app: []
    }; 

    var walker = walk.walk(globalConf.__base + "/prds/" + projectId + "/views/");

    /**
     * 检测到文件
     *
     * @event on file
     */
    walker.on("file", function(root, fileStats, next) {
        var fileName = fileStats.name;
        var htmlReg = new RegExp(/\.html$/);
        if (htmlReg.test(fileName) && fileName != "index.html") {
            var pFloder = root.substring(root.lastIndexOf("\\") + 1);

            // 组件页面模块
            var pageName = fileName.replace(htmlReg, "");
            var moduleKey;
            if (pFloder.indexOf("m-") > -1) {
                moduleKey = "wap";
            } else if (pFloder.indexOf("app-") > -1) {
                moduleKey = "app";
            } else {
                moduleKey = "pc";
            }

            pageList[moduleKey].push(pageName);
        }
        next();
    });
    
    /**
     * 检测爬虫结束
     *
     * @event on end
     */
    walker.on("end", function() {
        allPages[projectId] = pageList;
        callback && callback(response(resObj.success, {
            projectName: projectName,
            pageList: pageList
        }));
    });
}

/**
 * 获取页面数据
 *
 * @param {String} projectId 项目id
 * @param {Function} callback 回调方法
 * @method load
 */
var load = function(projectId, callback) {
    projectModule.getProjectNameById(projectId, function(resp) {
        if (resp.code == resObj.success.code) {
            var projectName = resp.data.projectName;
            if (!allPages[projectId] || allPages[projectId].length === 0) {
                _getRealPages(projectId, projectName, callback);
            } else {
                callback && callback(response(resObj.success, {
                    projectName: projectName,
                    pageList: allPages[projectId]
                }));
            }
        } else {
            callback && callback(resp);
        }
    });
}

/**
 * 更新缓存数据
 *
 * @param {String} projectId 项目id
 * @method updateAllPages
 */
var updateAllPages = function(projectId) {
    allPages[projectId] = null;
}

/**
 * loadPage 页面解析器
 *
 * @class loadPage
 * @author sam.sin
 * @constructor
 */
module.exports = {
    load: load,
    updateAllPages: updateAllPages
}
