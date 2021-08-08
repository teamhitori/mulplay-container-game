export declare class LogFactory {
    _loggers: {
        [id: string]: Logger;
    };
    get(loggerName: string): Logger;
    takeLogs(): {
        [id: string]: any[];
    };
}
export declare class Logger {
    logs: any[];
    log(...messages: any[]): void;
}
//# sourceMappingURL=Logger.d.ts.map