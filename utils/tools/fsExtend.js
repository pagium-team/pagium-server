"use strict";

var fs = require("fs");

/**
 * 删除文件夹，递归删除所有内容
 *
 * @path {String} path 文件夹路径
 * @method deleteFolder 
 */
var deleteFolder = function(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

module.exports = {
    deleteFolder: deleteFolder
}