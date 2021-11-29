"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const ws_1 = require("ws");
const http2 = tslib_1.__importStar(require("http2"));
const uuid_1 = require("uuid");
const Topic_1 = require("../documents/Topic");
const GameContainer_1 = require("./GameContainer");
const appInsights = tslib_1.__importStar(require("applicationinsights"));
const operators_1 = require("rxjs/operators");
let WebSocketService = class WebSocketService {
    _containers = {};
    _client;
    _connections = {};
    _connectionGame = {};
    _gameCreator = {};
    metricsSub;
    constructor() {
        appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
            .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
            .start();
        this._client = appInsights.defaultClient;
        this._initWebsocket();
    }
    _initWebsocket() {
        try {
            // const server = http2.createSecureServer({
            //   key: readFileSync('/data/front-proxy-key.pem'),
            //   cert: readFileSync('/data/front-proxy-crt.pem')
            // });
            const server = http2.createServer(() => { });
            //const wss = new WebSocketServer({ noServer: true });
            const wss = new ws_1.WebSocketServer({ port: 8080 });
            server.on('connect', (req, clientSocket, head) => {
                // Connect to an origin server
                console.log(`Connect event http://${req.url}`);
            });
            server.on('stream', (stream, headers) => {
                console.log("stream called");
            });
            server.on('error', (err) => console.error(err));
            server.on('upgrade', function upgrade(request, socket, head) {
                console.log(`upgrade event`, request);
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    console.log(`handleUpgrade event`, request);
                    wss.emit('connection', ws, request);
                });
            });
            console.log(`Starting server on port 8080`);
            // server.listen(8080,  () => {
            //   console.log(`listen server on port 8080`)
            // });
            wss.on('connection', (ws) => {
                try {
                    var connectionId = uuid_1.v4();
                    this._connections[connectionId] = ws;
                    var gameLoopSub = undefined;
                    var playerEventOutSub = undefined;
                    var metricsSub = undefined;
                    console.log(`new connectionId: ${connectionId}, url: ${ws.url}`);
                    ws.on('message', (event) => {
                        try {
                            var doc = JSON.parse(event.toString());
                            //console.log(`message topic: ${Topic[doc.topic]}, connectionId: ${connectionId}`);
                            switch (doc.topic) {
                                case Topic_1.Topic.ping:
                                    ws.send(JSON.stringify({ topic: Topic_1.Topic.ping, content: `Pong ${doc.content}` }));
                                    break;
                                case Topic_1.Topic.createGame:
                                    this._createGame(connectionId, doc);
                                    break;
                                case Topic_1.Topic.startGame:
                                    gameLoopSub?.unsubscribe();
                                    metricsSub?.unsubscribe();
                                    playerEventOutSub?.unsubscribe();
                                    gameLoopSub = this._startGame(connectionId, doc, ws);
                                    metricsSub = this._startMetrics(doc, ws);
                                    playerEventOutSub = this._startPlayerEvent(connectionId, doc, ws);
                                    break;
                                case Topic_1.Topic.destroyGame:
                                    this._destroyGame(connectionId, doc, ws);
                                    break;
                                case Topic_1.Topic.playerEnter:
                                    this._playerEnter(connectionId, doc);
                                    break;
                                case Topic_1.Topic.playerExit:
                                    this._playerExit(connectionId, doc);
                                    break;
                                case Topic_1.Topic.playerEventIn:
                                    this._playerEventIn(connectionId, doc);
                                    break;
                            }
                        }
                        catch (ex) {
                            console.log(ex);
                            this._client.trackException({ exception: ex });
                        }
                    });
                    ws.on('close', (event) => {
                        console.log(`Close Event connectionId:${connectionId}`, event);
                        const gamePrimaryName = this._connectionGame[connectionId];
                        if (gamePrimaryName) {
                            this._playerExit(connectionId, { gamePrimaryName: gamePrimaryName });
                        }
                        delete this._connections[connectionId];
                        delete this._connectionGame[connectionId];
                    });
                }
                catch (ex) {
                    console.log(ex);
                    this._client.trackException({ exception: ex });
                }
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _createGame(connectionId, request) {
        try {
            console.log(`createGame called. gamePrimaryName:${request.gamePrimaryName}, connectionId: ${connectionId}`);
            if (!this._containers[request.gamePrimaryName]) {
                this._containers[request.gamePrimaryName] = new GameContainer_1.GameContainer();
            }
            this._gameCreator[request.gamePrimaryName] = connectionId;
            this._containers[request.gamePrimaryName]?.createGame.call(this._containers[request.gamePrimaryName], request.content)
                .then(_ => {
            }).catch(ex => {
                console.log(ex);
                this._client.trackException({ exception: ex });
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _startGame(connectionId, request, ws) {
        try {
            console.log(`startGame called. gamePrimaryName:${request.gamePrimaryName}, connectionId: ${connectionId}`);
            this._connectionGame[connectionId] = request.gamePrimaryName;
            this._containers[request.gamePrimaryName]?.startGame.call(this._containers[request.gamePrimaryName], request);
            return this._containers[request.gamePrimaryName]?.gameLoop.call(this._containers[request.gamePrimaryName])
                .subscribe({
                next: content => {
                    var contentStr = JSON.stringify(content);
                    ws.send(JSON.stringify({ topic: Topic_1.Topic.gameLoop, content: contentStr }));
                },
                error: ex => {
                    console.log(ex);
                    console.log(`Error Loop Ending, gamePrimaryName:${request.gamePrimaryName}`);
                    this._client.trackException({ exception: ex });
                },
                complete: () => {
                    console.log(`Loop Ending, gamePrimaryName:${request.gamePrimaryName}`);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
        return undefined;
    }
    _startMetrics(request, ws) {
        try {
            console.log(`startMetrics called. gamePrimaryName:${request.gamePrimaryName}`);
            return this._containers[request.gamePrimaryName]?.startMetrics.call(this._containers[request.gamePrimaryName], request.content)
                .subscribe({
                next: content => {
                    ws.send(JSON.stringify({ topic: Topic_1.Topic.metrics, content: content }));
                },
                error: ex => {
                    console.log(ex);
                    console.log(`Error Metrics Ending, gamePrimaryName:${request.gamePrimaryName}`);
                    this._client.trackException({ exception: ex });
                },
                complete: () => {
                    console.log(`Metrics Ending, gamePrimaryName:${request.gamePrimaryName}`);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
        return undefined;
    }
    _startPlayerEvent(connectionId, request, ws) {
        try {
            console.log(`startPlayerEvent called.  gamePrimaryName:${request.gamePrimaryName}, connectionId:${connectionId}`);
            return this._containers[request.gamePrimaryName]?.playerEvents.call(this._containers[request.gamePrimaryName])
                .pipe(operators_1.filter(message => {
                var res = message.connectionId == connectionId;
                return res;
            }))
                .subscribe({
                next: message => {
                    var contentStr = JSON.stringify(message.state);
                    ws.send(JSON.stringify({ topic: Topic_1.Topic.playerEventOut, content: contentStr }));
                },
                error: ex => {
                    console.log(ex);
                    console.log(`Error User event Loop Ending, gamePrimaryName:${request.gamePrimaryName}`);
                    this._client.trackException({ exception: ex });
                },
                complete: () => {
                    console.log(`User event Loop Ending, gamePrimaryName:${request.gamePrimaryName}`);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _destroyGame(connectionId, request, ws) {
        try {
            console.log(`destroyGame called, gamePrimaryName:${request.gamePrimaryName}, conectionId:${connectionId}`);
            if (this._gameCreator[request.gamePrimaryName] != connectionId) {
                console.log(`This connection: conectionId:${connectionId} cannot destroy game: request.gamePrimaryName, created by: ${this._gameCreator[request.gamePrimaryName]}`);
                return;
            }
            var _this = this;
            this._containers[request.gamePrimaryName]?.destroyGame.call(this._containers[request.gamePrimaryName], request.content)
                .then(isMaterialDestroy => {
                if (!isMaterialDestroy)
                    return;
                for (const connectionId in _this._connectionGame) {
                    if (Object.prototype.hasOwnProperty.call(_this._connectionGame, connectionId)) {
                        const gamePrimaryName = _this._connectionGame[connectionId];
                        if (gamePrimaryName == request.gamePrimaryName) {
                            var socket = _this._connections[connectionId];
                            console.log(`Sending GameExit to connectionId:${connectionId}`);
                            socket?.send(JSON.stringify({ topic: Topic_1.Topic.gameEnd }));
                        }
                    }
                }
            })
                .catch(ex => {
                console.log(ex);
                this._client.trackException({ exception: ex });
            })
                .finally(() => {
                delete this._connectionGame[connectionId];
                ws.send(JSON.stringify({ topic: Topic_1.Topic.destroyGame }));
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _playerEnter(connectionId, request) {
        try {
            this._containers[request.gamePrimaryName]?.playerEnter.call(this._containers[request.gamePrimaryName], connectionId, request.content)
                .then(_ => {
            })
                .catch(ex => {
                console.log(ex);
                this._client.trackException({ exception: ex });
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _playerExit(connectionId, request) {
        try {
            console.log(`userExit called. connectionId:${request?.connectionId}, gamePrimaryName:${request.gamePrimaryName}`);
            this._containers[request.gamePrimaryName]?.playerExit.call(this._containers[request.gamePrimaryName], connectionId)
                .then(content => {
            })
                .catch(ex => {
                console.log(ex);
                this._client.trackException({ exception: ex });
            });
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
    _playerEventIn(connectionId, request) {
        try {
            this._containers[request.gamePrimaryName]?.playerEventIn.call(this._containers[request.gamePrimaryName], connectionId, request.content);
        }
        catch (ex) {
            console.log(ex);
            this._client.trackException({ exception: ex });
        }
    }
};
WebSocketService = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__metadata("design:paramtypes", [])
], WebSocketService);
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=WebSocketService.js.map