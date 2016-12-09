"use strict";

var events = require("events");
var emitter = new events.EventEmitter();

/**
 * Provides the global dirname
 *
 * @module global
 */
module.exports = {
	__base: __dirname, // 设置根目录全局变量
	__emitter: emitter,
	__projectFileLock: false, // 上传文件曹作锁
	__sessionDelay: 1000 * 60 * 60 * 24, // sid 有效时间
	__sessions: [] // 会话集合
}