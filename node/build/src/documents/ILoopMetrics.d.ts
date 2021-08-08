export interface ILoopMetrics {
    primaryName: string;
    orchestrationId: string;
    longestInterval: number;
    shortestInterval: number;
    averageInteval: number;
    itterations: number;
    previousStartTime: number;
    previousInterval: number;
    startTime: number;
    lastActive: number;
    logs: {
        [id: string]: string[];
    };
    debug: {
        [id: string]: any[];
    };
}
//# sourceMappingURL=ILoopMetrics.d.ts.map