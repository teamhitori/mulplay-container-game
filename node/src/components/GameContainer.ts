import { inject, injectable } from "inversify";
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil, map, bufferCount, bufferTime, throttleTime, filter } from "rxjs/operators";
import { json } from "express";
//import BABYLON from 'babylonjs';
const BABYLON = require('babylonjs');
import * as lodash from "lodash";

import { IGameContainer } from "../interfaces/IGameContainer";
import { IGrpcInterop } from "../interfaces/IGrpcInterop";
import { ILoopMetrics } from '../documents/ILoopMetrics';
import { IBackendApi } from '../interfaces/IBackendApi';
//import { IGameDefinition } from '../documents/IGameDefinition';
//import { IGameDefinitionInternal } from '../documents/IGameDefinitionInternal';
import { IGameDefinition } from '../documents/IGameDefinition';
import { IConnectedUserDocument } from '../documents/IConnectedUserDocument';
import { TYPES } from "./types";
import { LogFactory, Logger } from "./Logger";
import { copyObj } from "./Utils";

@injectable()
export class GameContainer implements IGameContainer {

    private _endLoop: Subject<string> = new Subject<string>();
    private _endMetrics: Subject<string> = new Subject<string>();
    private _gameStepObservable?: Subject<any> | null = null;
    private _metricsObservable?: Subject<any> | null = null;
    private _playerEventObservable: Subject<{ [id: string]: any; }> | null = null;

    private _loopMetrics = <ILoopMetrics>{
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
    }

    private _loopActive = false;
    //private _gameDefinitionInternal?: IGameDefinitionInternal;
    private _gameDefinition?: IGameDefinition;
    private _gamePrimaryName = ""

    // ## in game constructs ##
    // private _gameLoopLogic?: Function;
    // private _backendLogic?: Function;
    // private _userEnterLogic?: Function;
    // private _userEventLogic?: Function;
    // private _userExitLogic?: Function

    private _playerList: { [id: string]: any; } = {};
    private _nextPos = 0;
    private _newUserList: any[] = [];
    private _exitedUserList: any[] = [];
    private _playerEventQueue: IConnectedUserDocument[] = [];
    private _gameThis: {
        breakActive: boolean,
        _isStepComplete: boolean
    } = {
            breakActive: false,
            _isStepComplete: false
        };
    //private _breakActive = false;
    //private _isStepComplete = false;

    // ## babylon

    private _scene: BABYLON.Scene;
    private _logFactory: LogFactory;
    private _backendApi: IBackendApi;
    private _gameCreated: boolean = false;

    constructor() {

        var engine = new BABYLON.NullEngine();
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);

        this._scene = scene;
        this._logFactory = new LogFactory();

        console.log("render started");
        engine.runRenderLoop(() => {
            try {
                scene.render();
            } catch (ex) {
                this._logFactory.get("Scene Render Error").log(ex);
                this._loopActive = false;
                this._endLoop.next(".");
                this._endMetrics.next(".");
                throw ex;
            }

        });

        this._backendApi = <IBackendApi>{
            pushPlayerState: (playerPosition: number, state: any) => {
                for (let connectionId in this._playerList) {
                    if (this._playerList[connectionId] == playerPosition) {
                        this._playerEventObservable?.next({ "connectionId": connectionId, "state": state });
                    }
                }
            },
            pushGameState: (state: any) => {
                this._gameStepObservable?.next(state);
            },
            onPlayerEvent: (callback: (playerPosition: number, playerState: any) => void) => {
                this._onUserEventCallback = callback;
            },
            onGameLoop: (callback: () => void) => {
                this._onGameLoopCallback = callback;
            },
            onPlayerEnter: (callback: (playerPosition: number) => void) => {
                this._onUserEnterCallback = callback;
            },
            onPlayerExit: (callback: (playerPosition: number) => void) => {
                this._onUserExitCallback = callback;
            },
            onGameStop: (callback: () => void) => {
                this._onGameStopCallback = callback;
            },
            onGameStart: (callback: () => void) => {
                this._onGameStartCallback = callback;
            }
        };
    }

    private _onUserEventCallback: (playerPosition: number, playerState: any) => void = _ => { console.log("On player Event callback not set") };
    private _onGameLoopCallback: () => void = () => { console.log("On game loop callback not set") };
    private _onUserEnterCallback: (playerPosition: number) => void = _ => { console.log("On player enter callback not set") };
    private _onUserExitCallback: (playerPosition: number) => void = _ => { console.log("On player exit callback not set") };
    private _onGameStopCallback: () => void = () => { console.log("On game stop callback not set") };
    private _onGameStartCallback: () => void = () => { console.log("On game start callback not set") };

    createGame(content: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                var logger = this._logFactory.get("Back End");

                this._gameDefinition = JSON.parse(content);
                var backendLogic = new Function("require", "logger", "scene", "gameConfig", "backendApi", `${this._gameDefinition?.backendLogic}`);

                backendLogic.call(this._gameThis, require, logger, this._scene, this._gameDefinition?.gameConfig, this._backendApi);

                this._gameCreated = true;

            } catch (ex) {
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

    startGame(contentIn: any) {
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
            } catch (ex: any) {
                loggerstart.log(ex.message);
            }

            this._startGameLoop();
        } else {
            loggerstart.log("-- Loop Already active - skipping start --");
        }

        if (!this._gameStepObservable) {
            this._gameStepObservable = new Subject<any>();
        }

        if (!this._metricsObservable) {
            this._metricsObservable = new Subject<any>();
        }

        if (!this._playerEventObservable) {
            this._playerEventObservable = new Subject<any>();
        }
    }

    gameLoop(): Observable<any> {
        return this._gameStepObservable!!
            .pipe(
                bufferTime(Math.max(100, this._gameDefinition?.gameConfig?.intervalMs ?? 100)),
                map(content => {
                    //console.log(`return content`, contentIn);
                    return content;
                }));
    }

    playerEvents(): Observable<any> {
        return this._playerEventObservable!!
            .pipe(
                bufferTime(Math.max(100, this._gameDefinition?.gameConfig?.intervalMs ?? 100)),
                filter(content => {
                    return !!content?.length;
                }),
                map(content => {
                    return content;
                }));
    }



    _startGameLoop() {
        this._loopActive = true;
        const source = interval(this._gameDefinition?.gameConfig?.intervalMs ?? 100);
        var loggerLoop = this._logFactory.get("GameLoopLogic");
        var loggerUserEnter = this._logFactory.get("UserEnterLogic");
        var loggerUserExit = this._logFactory.get("UserExitLogic");
        var loggerUserEvent = this._logFactory.get("UserEventLogic");

        source
            .pipe(
                takeUntil(this._endLoop),
                filter(() => {
                    return !(this._gameThis.breakActive && this._gameThis._isStepComplete);
                }))
            .subscribe(
                _ => {
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
                            console.log(`Game ending due to inactivity. gamePrimaryName:${this._gamePrimaryName} `)
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
                            } catch (ex: any) {
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
                            } catch (ex: any) {
                                loggerUserExit.log(`Error: ${ex.message}`);
                                throw new Error(`User Exit Excepion: ${ex.message}`);
                            }

                            console.log(`executed userExitLogic. gamePriamryName:${this._gamePrimaryName}, pos:${nextPos}`);
                        }

                        // --- User Event Logic
                        while (this._playerEventQueue.length) {
                            var event = this._playerEventQueue.shift();
                            var playerPos = this._playerList[`${event?.connectionId}`]

                            if (playerPos >= 0) {
                                

                                try {
                                    var playerEventList = JSON.parse(`${event?.content}`);
                                for (let playerEvent of playerEventList) {
                                    this._onUserEventCallback(playerPos, playerEvent.data);
                                }

                                } catch (ex: any) {
                                    loggerUserEvent.log(`Error: ${ex.message}`);
                                    throw new Error(`Player Event Excepion: ${ex.message}`);
                                }

                            } else {
                                console.log(`Could not find user: ${event?.connectionId}`);

                            }
                        }

                        // --- Loop step logic
                        try {
                            //this._executeUserFunction("gameLoopLogic", loggerLoop, this._gameLoopLogic);
                            //this._gameLoopLogic?.call(this._gameThis, require, loggerLoop, this._scene, this._gameState);
                            this._onGameLoopCallback();
                        } catch (ex: any) {
                            loggerLoop.log(`Error: ${ex.message}`);
                            throw new Error(`Game Loop Excepion: ${ex.message}`);
                        }

                        // ---

                        //this._gameState.breakActive = this._gameThis.breakActive;
                        // ---

                        //clearTimeout(loopTimeout);

                        var metrics = copyObj(this._loopMetrics);
                        metrics.logs = this._logFactory.takeLogs();

                        //this._loopMetrics.logs = this._logFactory.takeLogs();
                        //this._gameStepObservable?.next(this._gameState);
                        this._metricsObservable?.next(metrics);

                    } catch (ex) {
                        this._loopActive = false;
                        this._endLoop.next(".");
                        this._endMetrics.next(".");
                    }
                },
                ex => {
                    this._metricsObservable?.next({ error: ex.message });
                    this._gameStepObservable?.error({ error: ex.message });
                    this._gameStepObservable = null;
                    this._loopActive = false;
                },
                () => {
                    this._onGameStopCallback();
                    var metrics = copyObj(this._loopMetrics);
                    metrics.logs = this._logFactory.takeLogs();
                    this._metricsObservable?.next(metrics);
                    this._gameStepObservable?.complete();
                    this._gameStepObservable = null;
                    this._loopActive = false;
                });

    }

    startMetrics(_: string): Observable<string> {

        if (!this._gameStepObservable) {
            this._gameStepObservable = new Subject<string>();
        }

        if (!this._metricsObservable) {
            this._metricsObservable = new Subject<any>();
        }

        return this._metricsObservable!!
            .pipe(
                takeUntil(this._endMetrics),
                bufferTime(3000),
                filter(content => {
                    return content.length > 0;
                }),
                map(content => {
                    try {
                        var str = JSON.stringify(content);
                        return str;
                    } catch (ex) {
                        console.log(ex);
                    }
                    return "";

                }));
    }

    stepGame(content: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._loopMetrics.lastActive = new Date().getTime();

            this._gameThis.breakActive = true;
            this._gameThis._isStepComplete = false;

            resolve(content);
        });
    }

    destroyGame(content: string): Promise<string> {
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

    playerEnter(connectionIdIn: string, content: string): Promise<string> {
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

                if(!existingUser){
                    console.log(`### NEW USER [${connectionIdIn}]: ${content}, pos: ${nextPos}`);
                    this._nextPos++;
                }
                
                this._loopMetrics.lastActive = new Date().getTime();

                this._playerList[connectionIdIn] = nextPos;
                this._newUserList.push(nextPos);

                resolve(JSON.stringify({ position: this._playerList[connectionIdIn] }));

            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }

    playerExit(connectionIdIn: string, content: string): Promise<string> {
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
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }

    playerEventIn(data: any) {
        try {
            this._loopMetrics.lastActive = new Date().getTime();
            this._playerEventQueue.push(data)
        } catch (ex) {
            console.log(ex);
        }
    }

    // _executeUserFunction(tag: string, logger: Logger, func?: Function, eventData?: any){
    //     var debugData: any = {};

    //     if(this._gameState.breakActive){
    //         debugData["in"] = {
    //             this: copyObj(this._gameThis),
    //             gameState:  copyObj(this._gameState) ,
    //             eventData: eventData
    //         }
    //     }

    //     func?.call(this._gameThis, require, logger, this._scene, this._gameState, eventData);

    //     if(this._gameState.breakActive){
    //         debugData["out"] = {
    //             this: copyObj(this._gameThis),
    //             gameState:  copyObj(this._gameState) 
    //         }

    //         if(!this._loopMetrics.debug[tag]) {
    //             this._loopMetrics.debug[tag] = [];
    //         }

    //         this._loopMetrics.debug[tag].push(debugData)
    //     }
    // }
}