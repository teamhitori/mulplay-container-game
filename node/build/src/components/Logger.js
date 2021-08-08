"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogFactory = void 0;
const Utils_1 = require("./Utils");
class LogFactory {
    _loggers = {};
    get(loggerName) {
        if (!this._loggers[loggerName]) {
            this._loggers[loggerName] = new Logger();
        }
        return this._loggers[loggerName];
    }
    takeLogs() {
        var result = {};
        for (var name in this._loggers) {
            var logger = this._loggers[name];
            result[name] = logger.logs;
            logger.logs = [];
        }
        return result;
    }
}
exports.LogFactory = LogFactory;
class Logger {
    logs = [];
    log(...messages) {
        // remove circular references
        const convertedMessages = [];
        for (const message of messages) {
            const converted = Utils_1.copyObj(message);
            convertedMessages.push(converted);
        }
        this.logs.push(convertedMessages);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map