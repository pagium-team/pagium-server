"use strict";

/**
 * projects 管理
 *
 * @author fsiaonma
 * @module loadProject.js
 * @constructor
 */
var fs = require("fs");
var unzip = require("unzip");
var fstream = require("fstream");

var em = require("../../libs/eagle-mysql/eagleMysql");
var sqlCondtion = require("../../libs/eagle-mysql/sqlCondition");

var globalConf = require("../../global"); // 全局变量
var response = require("../../utils/net").response;
var resObj = require("../../conf").resObj;
var fsExtend = require("../../utils/tools").fsExtend;
var dateTool = require("../../utils/tools").dateTool;
var publisher = require("../../engine/publisher");

/**
 * 添加项目
 *
 * @param {String} projectName 项目名称
 * @param {String} projectDesc 项目描述
 * @param {Function} callback 回调方法
 * @method addProject
 */
var addProject = function(projectName, projectDesc, callback) {
    var date = new Date().getTime();
    var insertParams = {                             
        table  : "t_project",                      
        keys   : ["NAME", "DESCRIPTION", "CREATE_TIME", "UPDATE_TIME", "STATUS"],                       
        values : [projectName, projectDesc, date, date, "Normal"]                        
    };       
    em.connect();                                        
    em.insert(insertParams, {                
        success : function (data) {
            callback && callback(response(resObj.success));               
        },                                           
        error : function (err) {                     
            callback && callback(response(resObj.addProjectFail));                   
        }                                          
    });
    em.connect(); 
}

/**
 * 获取所有项目
 *
 * @param {String} pageIndex 当前页面
 * @param {String} pageSize 页面大小
 * @param {Function} callback 回调方法
 * @method addProject
 */
var getProjectList = function(pageIndex, pageSize, callback) {
	var selParams = {                                                                
        keys       : ['*'],                                                   
        table      : 't_project',                                                  
        conditions : new sqlCondtion().where("STATUS = 'Normal'").orderBy("ID", "DESC").limit((pageIndex - 1) * pageSize, pageSize).getSql()
    };
	em.connect();                                                                   
    em.select(selParams, {                                                   
        success : function (resp) {
		  	var projectList = [];

            for (var i = 0, len = resp.results.length; i < len; ++i) {
                projectList.push({
                    projectId: resp.results[i].ID,
                    projectName: resp.results[i].NAME,
                    projectDesc: resp.results[i].DESCRIPTION,
                    createTime: dateTool.dateTimeFormat(resp.results[i].CREATE_TIME),
                    updateTime: dateTool.dateTimeFormat(resp.results[i].UPDATE_TIME)
                })
            }

            var selParams = {                                                                
                keys       : ['count(*)'],
                table      : 't_project',
                conditions : new sqlCondtion().where("STATUS = 'Normal'").getSql()
            };
            em.connect();
            em.select(selParams, {
                success: function(resp) {
                    callback && callback(response(resObj.success, {
                        projectList: projectList,
                        total: resp.results[0]["count(*)"]
                    }));
                },
                error: function() {
                    console.log(err) 
                }
            });
            em.disconnect();
		},                                                                                 
        error: function (err) {                                                     
            console.log(err)                                                         
        },                                                                           
    });  
    em.disconnect();
}

/**
 * 根据项目id，获取项目名
 *
 * @param {Number} projectId 项目id
 * @param {Function} callback 回调方法
 * @method getProjectNameById
 */
var getProjectNameById = function(projectId, callback) {
    var selParams = {                                                                
        keys       : ['NAME'],                                                   
        table      : 't_project',                                                  
        conditions : new sqlCondtion().where("ID = '" + projectId + "'").and("STATUS = 'Normal'").getSql()
    };            
    em.connect();                                                                   
    em.select(selParams, {
        success : function (resp) {
            var results = resp.results;
            if (results && results[0]) {
                var projectName = results[0].NAME;
                callback && callback(response(resObj.success, {
                    projectName: projectName
                }))
            } else {
                callback && callback(response(resObj.projectIdNotFound));
            }
        }, 
        error: function() {
            callback && callback(response(resObj.projectIdNotFound));   
        }
    });
    em.disconnect();
}

/**
 * 获取所有项目
 *
 * @param {Number} projectId 项目id
 * @param {Object} files 文件对象 
 * @param {Function} callback 回调方法
 * @method uploadProjectFile
 */
var uploadProjectFile = function(projectId, files, callback) {
    if (globalConf.__projectFileLock) {
        callback && callback(response(resObj.fileOperating));
        return ;
    }

    globalConf.__projectFileLock = true;

    getProjectNameById(projectId, function(resp) {
        if (resp.code != resObj.success.code) {
            callback && callback(resp);
            return ;   
        }

        var rootPath = globalConf.__base + "/prds/";
        var projectPath = rootPath + projectId;
        var zipPath = rootPath + projectId + "/" + projectId + ".zip";

        if (files.projectFile.path.indexOf(".zip") < 0) {
            callback && callback(response(resObj.uploadProjectFileWrongFormat));
            return ;
        }

        if (!fs.existsSync(rootPath)) { // 首次上传需新建目录
            fs.mkdirSync(rootPath);
        }
        if (fs.existsSync(projectPath)) { // 如果已经存在该文件，先删除，保证最新。
            fsExtend.deleteFolder(projectPath);
        }  
        if (fs.existsSync(zipPath)) { // 如果旧 zip 包存在，先删除
            fs.unlinkSync(zipPath);
        }  

        try {
            // 建文件夹
            fs.mkdirSync(projectPath);

            // 写文件
            // fs.renameSync(files.projectFile.path, zipPath);
            var readZipStream = fs.createReadStream(files.projectFile.path);
            var writeZipStream = fstream.Writer(zipPath);
            readZipStream.pipe(writeZipStream);
            writeZipStream.on("close", function() {
                // 解压
                var unzipString = unzip.Parse();
                var readStream = fs.createReadStream(zipPath);
                var writeStream = fstream.Writer(projectPath);

                var readPipe = readStream.pipe(unzipString);
                var writePipe = readPipe.pipe(writeStream);

                writeStream.on("close", function() {
                    // 删除 zip 包
                    fs.unlinkSync(zipPath);

                    // 清空缓存
                    globalConf.__emitter.emit("writePage", {
                        projectId: projectId
                    });
                    globalConf.__emitter.emit("writeCom", {
                        projectId: projectId
                    });

                    globalConf.__projectFileLock = false;

                    publisher.poam.pushLib(projectId, function() {
                        callback && callback(response(resObj.success));
                    });
                });
            });
        } catch (e) {
            console.log(e);
            globalConf.__projectFileLock = false;
            callback && callback(response(resObj.uploadProjectFileFail));

        }
    });
}

/**
 * loadProject 项目解释器
 * @class loadProject
 * @author fsiaonma
 * @constructor
 */
module.exports = {
    addProject: addProject,
	getProjectList: getProjectList,
    getProjectNameById: getProjectNameById,
    uploadProjectFile: uploadProjectFile
}
