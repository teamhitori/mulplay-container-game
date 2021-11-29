import { Subscription } from "rxjs";
export declare class WebSocketService {
    private _containers;
    private _client;
    private _connections;
    private _connectionGame;
    private _gameCreator;
    metricsSub?: Subscription;
    constructor();
    private _initWebsocket;
    private _createGame;
    private _startGame;
    private _startMetrics;
    private _startPlayerEvent;
    private _destroyGame;
    private _playerEnter;
    private _playerExit;
    private _playerEventIn;
}
//# sourceMappingURL=WebSocketService.d.ts.map