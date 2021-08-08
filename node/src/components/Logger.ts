import { copyObj } from "./Utils"
export class LogFactory {

    _loggers: { [id: string]: Logger; } = {};

    get(loggerName: string): Logger {

        if (!this._loggers[loggerName]) {
            this._loggers[loggerName] = new Logger();
        }

        return this._loggers[loggerName];
    }

    takeLogs(): { [id: string]: any[]; } {

        var result: { [id: string]: any[]; } = {};

        for (var name in this._loggers) {
            var logger = this._loggers[name];
            result[name] = logger.logs;
            logger.logs = [];
        }

        return result;
    }
}

export class Logger {

    public logs: any[] = [];

    public log(...messages: any[]): void {
        // remove circular references
        const convertedMessages = []
        for (const message of messages) {
            const converted = copyObj(message);
            convertedMessages.push(converted);
        }
        this.logs.push(convertedMessages)
    }

    
}