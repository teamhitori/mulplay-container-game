"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameContainer = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
//import BABYLON from 'babylonjs';
const BABYLON = require('babylonjs');
const Logger_1 = require("./Logger");
const Utils_1 = require("./Utils");
let GameContainer = class GameContainer {
    _endLoop = new rxjs_1.Subject();
    _endMetrics = new rxjs_1.Subject();
    _gameStepObservable = null;
    _metricsObservable = null;
    _playerEventObservable = null;
    _loopMetrics = {
        primaryName: "",
        orchestrationId: "",
        longestInterval: 0,
        shortestInterval: Number.MAX_VALUE,
        averageInteval: 0,
        itterations: 0,
        previousStartTime: 0,
        previousInterval: 0,
        startTime: 0,
        lastActive: 0,
        debug: {}
    };
    _loopActive = false;
    //private _gameDefinitionInternal?: IGameDefinitionInternal;
    _gameDefinition;
    _gamePrimaryName = "";
    // ## in game constructs ##
    // private _gameLoopLogic?: Function;
    // private _backendLogic?: Function;
    // private _userEnterLogic?: Function;
    // private _userEventLogic?: Function;
    // private _userExitLogic?: Function
    _playerList = {};
    _nextPos = 0;
    _newUserList = [];
    _exitedUserList = [];
    _playerEventQueue = [];
    _gameThis = {
        breakActive: false,
        _isStepComplete: false
    };
    //private _breakActive = false;
    //private _isStepComplete = false;
    // ## babylon
    _scene;
    _logFactory;
    _backendApi;
    _gameCreated = false;
    constructor() {
        var engine = new BABYLON.NullEngine();
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
        this._scene = scene;
        this._logFactory = new Logger_1.LogFactory();
        console.log("render started");
        engine.runRenderLoop(() => {
            try {
                scene.render();
            }
            catch (ex) {
                this._logFactory.get("Scene Render Error").log(ex);
                this._loopActive = false;
                this._endLoop.next(".");
                this._endMetrics.next(".");
                throw ex;
            }
        });
        this._backendApi = {
            pushPlayerState: (playerPosition, state) => {
                for (let connectionId in this._playerList) {
                    if (this._playerList[connectionId] == playerPosition) {
                        this._playerEventObservable?.next({ "connectionId": connectionId, "state": state });
                    }
                }
            },
            pushGameState: (state) => {
                this._gameStepObservable?.next(state);
            },
            onPlayerEvent: (callback) => {
                this._onUserEventCallback = callback;
            },
            onGameLoop: (callback) => {
                this._onGameLoopCallback = callback;
            },
            onPlayerEnter: (callback) => {
                this._onUserEnterCallback = callback;
            },
            onPlayerExit: (callback) => {
                this._onUserExitCallback = callback;
            },
            onGameStop: (callback) => {
                this._onGameStopCallback = callback;
            },
            onGameStart: (callback) => {
                this._onGameStartCallback = callback;
            }
        };
    }
    _onUserEventCallback = _ => { console.log("On player Event callback not set"); };
    _onGameLoopCallback = () => { console.log("On game loop callback not set"); };
    _onUserEnterCallback = _ => { console.log("On player enter callback not set"); };
    _onUserExitCallback = _ => { console.log("On player exit callback not set"); };
    _onGameStopCallback = () => { console.log("On game stop callback not set"); };
    _onGameStartCallback = () => { console.log("On game start callback not set"); };
    createGame(content) {
        return new Promise((resolve, reject) => {
            try {
                var logger = this._logFactory.get("Back End");
                this._gameDefinition = JSON.parse(content);
                var backendLogic = new Function("require", "logger", "scene", "gameConfig", "backendApi", `${this._gameDefinition?.backendLogic}`);
                backendLogic.call(this._gameThis, require, logger, this._scene, this._gameDefinition?.gameConfig, this._backendApi);
                this._gameCreated = true;
            }
            catch (ex) {
                this._logFactory.get("create game").log(ex);
                this._loopMetrics.logs = this._logFactory.takeLogs();
                this._metricsObservable?.next(this._loopMetrics);
                this._loopActive = false;
                this._endLoop.next(".");
                this._endMetrics.next(".");
            }
            resolve(content);
        });
    }
    startGame(contentIn) {
        var loggerstart = this._logFactory.get("StartLogic");
        this._loopMetrics.lastActive = new Date().getTime();
        this._gameThis.breakActive = false;
        if (!this._loopActive && this._gameCreated) {
            loggerstart.log(`## STARTING GAME LOOP ## primaryName: ${contentIn.gamePrimaryName}`);
            this._gamePrimaryName = contentIn.gamePrimaryName;
            this._playerEventQueue = [];
            this._gameThis = { breakActive: false, _isStepComplete: false };
            try {
                //this._executeUserFunction("startLogic", loggerstart, this._startLogic);
                //this._backendLogic?.call(this._gameThis, require, loggerstart, this._scene, this._gameState);
                this._onGameStartCallback();
            }
            catch (ex) {
                loggerstart.log(ex.message);
            }
            this._startGameLoop();
        }
        else {
            loggerstart.log("-- Loop Already active - skipping start --");
        }
        if (!this._gameStepObservable) {
            this._gameStepObservable = new rxjs_1.Subject();
        }
        if (!this._metricsObservable) {
            this._metricsObservable = new rxjs_1.Subject();
        }
        if (!this._playerEventObservable) {
            this._playerEventObservable = new rxjs_1.Subject();
        }
    }
    gameLoop() {
        return this._gameStepObservable
            .pipe(operators_1.bufferTime(Math.max(100, this._gameDefinition?.gameConfig?.intervalMs ?? 100)), operators_1.map(content => {
            //console.log(`return content`, contentIn);
            return content;
        }));
    }
    playerEvents() {
        return this._playerEventObservable
            .pipe(operators_1.bufferTime(Math.max(100, this._gameDefinition?.gameConfig?.intervalMs ?? 100)), operators_1.filter(content => {
            return !!content?.length;
        }), operators_1.map(content => {
            return content;
        }));
    }
    _startGameLoop() {
        this._loopActive = true;
        const source = rxjs_1.interval(this._gameDefinition?.gameConfig?.intervalMs ?? 100);
        var loggerLoop = this._logFactory.get("GameLoopLogic");
        var loggerUserEnter = this._logFactory.get("UserEnterLogic");
        var loggerUserExit = this._logFactory.get("UserExitLogic");
        var loggerUserEvent = this._logFactory.get("UserEventLogic");
        source
            .pipe(operators_1.takeUntil(this._endLoop), operators_1.filter(() => {
            return !(this._gameThis.breakActive && this._gameThis._isStepComplete);
        }))
            .subscribe(_ => {
            try {
                this._gameThis._isStepComplete = true;
                var intervalStartTime = new Date().getTime();
                this._loopMetrics.itterations++;
                this._loopMetrics.previousStartTime = this._loopMetrics.previousStartTime ? this._loopMetrics.previousStartTime : intervalStartTime;
                const currentInterval = intervalStartTime - this._loopMetrics.previousStartTime;
                this._loopMetrics.shortestInterval = currentInterval < this._loopMetrics.shortestInterval ? currentInterval : this._loopMetrics.shortestInterval;
                this._loopMetrics.longestInterval = currentInterval > this._loopMetrics.longestInterval ? currentInterval : this._loopMetrics.longestInterval;
                this._loopMetrics.averageInteval = (this._loopMetrics.averageInteval * (this._loopMetrics.itterations - 1) + currentInterval) / this._loopMetrics.itterations;
                this._loopMetrics.previousStartTime = intervalStartTime;
                this._loopMetrics.previousInterval = currentInterval;
                //console.log(`Interval: ${this._loopMetrics.previousInterval}, Last Active: ${intervalStartTime - this._loopMetrics.lastActive}`);
                if (intervalStartTime - this._loopMetrics.lastActive > 120000) {
                    console.log(`Game ending due to inactivity. gamePrimaryName:${this._gamePrimaryName} `);
                    this._loopActive = false;
                    this._endLoop.next(".");
                    this._endMetrics.next(".");
                }
                // var loopTimeout = setTimeout(() => { 
                //     throw new Error(`Loop logic timeout Exception, logic exceeded 1 second`); 
                // }, 1000);
                // --- User Enter Logic
                while (this._newUserList.length) {
                    var nextPos = this._newUserList.shift();
                    try {
                        this._onUserEnterCallback(nextPos);
                    }
                    catch (ex) {
                        loggerUserEnter.log(`Error: ${ex.message}`);
                        throw new Error(`User Enter Excepion: ${ex.message}`);
                    }
                    console.log(`executed userEnterLogic. gamePrimaryName:${this._gamePrimaryName}, pos:${nextPos}`);
                }
                // --- User Exit Logic
                while (this._exitedUserList.length) {
                    var nextPos = this._exitedUserList.shift();
                    try {
                        this._onUserExitCallback(playerPos);
                    }
                    catch (ex) {
                        loggerUserExit.log(`Error: ${ex.message}`);
                        throw new Error(`User Exit Excepion: ${ex.message}`);
                    }
                    console.log(`executed userExitLogic. gamePriamryName:${this._gamePrimaryName}, pos:${nextPos}`);
                }
                // --- User Event Logic
                while (this._playerEventQueue.length) {
                    var event = this._playerEventQueue.shift();
                    var playerPos = this._playerList[`${event?.connectionId}`];
                    if (playerPos >= 0) {
                        try {
                            var playerEventList = JSON.parse(`${event?.content}`);
                            for (let playerEvent of playerEventList) {
                                this._onUserEventCallback(playerPos, playerEvent.data);
                            }
                        }
                        catch (ex) {
                            loggerUserEvent.log(`Error: ${ex.message}`);
                            throw new Error(`Player Event Excepion: ${ex.message}`);
                        }
                    }
                    else {
                        console.log(`Could not find user: ${event?.connectionId}`);
                    }
                }
                // --- Loop step logic
                try {
                    //this._executeUserFunction("gameLoopLogic", loggerLoop, this._gameLoopLogic);
                    //this._gameLoopLogic?.call(this._gameThis, require, loggerLoop, this._scene, this._gameState);
                    this._onGameLoopCallback();
                }
                catch (ex) {
                    loggerLoop.log(`Error: ${ex.message}`);
                    throw new Error(`Game Loop Excepion: ${ex.message}`);
                }
                // ---
                //this._gameState.breakActive = this._gameThis.breakActive;
                // ---
                //clearTimeout(loopTimeout);
                var metrics = Utils_1.copyObj(this._loopMetrics);
                metrics.logs = this._logFactory.takeLogs();
                //this._loopMetrics.logs = this._logFactory.takeLogs();
                //this._gameStepObservable?.next(this._gameState);
                this._metricsObservable?.next(metrics);
            }
            catch (ex) {
                this._loopActive = false;
                this._endLoop.next(".");
                this._endMetrics.next(".");
            }
        }, ex => {
            this._metricsObservable?.next({ error: ex.message });
            this._gameStepObservable?.error({ error: ex.message });
            this._gameStepObservable = null;
            this._loopActive = false;
        }, () => {
            this._onGameStopCallback();
            var metrics = Utils_1.copyObj(this._loopMetrics);
            metrics.logs = this._logFactory.takeLogs();
            this._metricsObservable?.next(metrics);
            this._gameStepObservable?.complete();
            this._gameStepObservable = null;
            this._loopActive = false;
        });
    }
    startMetrics(_) {
        if (!this._gameStepObservable) {
            this._gameStepObservable = new rxjs_1.Subject();
        }
        if (!this._metricsObservable) {
            this._metricsObservable = new rxjs_1.Subject();
        }
        return this._metricsObservable
            .pipe(operators_1.takeUntil(this._endMetrics), operators_1.bufferTime(3000), operators_1.filter(content => {
            return content.length > 0;
        }), operators_1.map(content => {
            try {
                var str = JSON.stringify(content);
                return str;
            }
            catch (ex) {
                console.log(ex);
            }
            return "";
        }));
    }
    stepGame(content) {
        return new Promise((resolve, reject) => {
            this._loopMetrics.lastActive = new Date().getTime();
            this._gameThis.breakActive = true;
            this._gameThis._isStepComplete = false;
            resolve(content);
        });
    }
    destroyGame(content) {
        return new Promise((resolve, reject) => {
            this._playerList = {};
            this._nextPos = 0;
            this._playerEventQueue = [];
            this._gameThis = { breakActive: false, _isStepComplete: false };
            this._loopActive = false;
            this._endLoop.next(".");
            this._endMetrics.next(".");
            resolve(content);
        });
    }
    playerEnter(connectionIdIn, content) {
        return new Promise((resolve, reject) => {
            try {
                var existingUser = false;
                var nextPos = this._nextPos;
                for (const connectionId in this._playerList) {
                    if (connectionId == connectionIdIn) {
                        existingUser = true;
                        nextPos = this._playerList[connectionIdIn];
                        console.log(`## Existing USER ${connectionIdIn}, pos: ${this._playerList[connectionIdIn]}`);
                    }
                }
                if (!existingUser) {
                    console.log(`### NEW USER [${connectionIdIn}]: ${content}, pos: ${nextPos}`);
                    this._nextPos++;
                }
                this._loopMetrics.lastActive = new Date().getTime();
                this._playerList[connectionIdIn] = nextPos;
                this._newUserList.push(nextPos);
                resolve(JSON.stringify({ position: this._playerList[connectionIdIn] }));
            }
            catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }
    playerExit(connectionIdIn, content) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`### USER EXITED [${connectionIdIn}]: ${content} ###`);
                for (const connectionId in this._playerList) {
                    if (connectionId == connectionIdIn) {
                        this._exitedUserList.push(this._playerList[connectionIdIn]);
                        delete this._playerList[connectionIdIn];
                        var playerCount = 0;
                        for (const pos in this._playerList) {
                            playerCount++;
                        }
                        console.log(`Removing existing connection ${connectionIdIn}, new user count: ${playerCount}`);
                    }
                }
                resolve(content);
            }
            catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }
    playerEventIn(data) {
        try {
            this._loopMetrics.lastActive = new Date().getTime();
            this._playerEventQueue.push(data);
        }
        catch (ex) {
            console.log(ex);
        }
    }
};
GameContainer = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__metadata("design:paramtypes", [])
], GameContainer);
exports.GameContainer = GameContainer;
//# sourceMappingURL=GameContainer.js.map