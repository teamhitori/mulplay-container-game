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

    // ## in game constructs ##
    private _gameLoopLogic?: Function;
    private _startLogic?: Function;
    private _userEnterLogic?: Function;
    private _userEventLogic?: Function;
    private _userExitLogic?: Function
    private _gameState: any = {};
    private _userList: { [id: string]: any; } = {};
    private _nextPos = 0;
    private _newUserList: any[] = [];
    private _exitedUserList: any[] = [];
    private _userEventQueue: IConnectedUserDocument[] = [];
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

    constructor() {

        var engine = new BABYLON.NullEngine();
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);

        this._scene = scene;

        this._logFactory = new LogFactory();

        console.log("render started");
        engine.runRenderLoop(function () {
            scene.render();
        })
    }

    createGame(content: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this._gameDefinition = JSON.parse(content);
                this._startLogic = new Function("require", "logger", "scene", "gameState", `${this._gameDefinition?.startLogic}`);
                this._gameLoopLogic = new Function("require", "logger", "scene", "gameState", `${this._gameDefinition?.gameLoopLogic}`);
                this._userEventLogic = new Function("require", "logger", "scene", "gameState", "eventData", `${this._gameDefinition?.userEventLogic}`);
                this._userEnterLogic = new Function("require", "logger", "scene", "gameState", "eventData", `${this._gameDefinition?.userEnterLogic}`);
                this._userExitLogic = new Function("require", "logger", "scene", "gameState", "eventData", `${this._gameDefinition?.userExitLogic}`);

            } catch (ex) {
                this._logFactory.get("create game").log(ex);
            }
            resolve(content);
        });
    }

    startGame(contentIn: any): Observable<any> {
        var loggerstart = this._logFactory.get("StartLogic");

        this._loopMetrics.lastActive = new Date().getTime();
        this._gameThis.breakActive = false;

        if (!this._loopActive) {
            loggerstart.log(`## STARTING GAME LOOP ## primaryName: ${contentIn.gamePriamryName}`);

            this._gameState = {};
            //this._userList = {};
            //this._userCount = 0;
            this._userEventQueue = [];
            this._gameThis = { breakActive: false, _isStepComplete: false };

            try {
                //this._executeUserFunction("startLogic", loggerstart, this._startLogic);
                this._startLogic?.call(this._gameThis, require, loggerstart, this._scene, this._gameState);
            } catch (ex) {
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

        return this._gameStepObservable!!
            .pipe(
                bufferTime(Math.max(100, this._gameDefinition?.intervalMs ?? 100)),
                map(content => {
                    //console.log(`return content`, contentIn);
                    return content;
                }));
    }


    _startGameLoop() {
        this._loopActive = true;
        const source = interval(this._gameDefinition?.intervalMs ?? 100);
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
                                //this._executeUserFunction("userEnterLogic", loggerUserEnter, this._userEnterLogic, { position: nextPos });
                                this._userEnterLogic?.call(this._gameThis, require, loggerUserEnter, this._scene, this._gameState, { position: nextPos });
                            } catch (ex) {
                                throw new Error(`User Enter Excepion: ${ex.message}`);
                            }


                            console.log(`executed _userEnterLogic pos:${nextPos}`);
                        }

                        // --- User Exit Logic

                        while (this._exitedUserList.length) {
                            var nextPos = this._exitedUserList.shift();

                            try {
                                //this._executeUserFunction("userExitLogic", loggerUserExit, this._userExitLogic, { position: nextPos });
                                this._userExitLogic?.call(this._gameThis, require, loggerUserExit, this._scene, this._gameState, { position: nextPos });
                            } catch (ex) {
                                throw new Error(`User Exit Excepion: ${ex.message}`);
                            }

                            console.log(`executed _userExitLogic pos:${nextPos}`);
                        }

                        // --- User Event Logic

                        while (this._userEventQueue.length) {
                            var event = this._userEventQueue.shift();
                            var userPos = this._userList[`${event?.connectionId}`]

                            if (userPos >= 0) {
                                var userEventListWrapper = JSON.parse(`${event?.content}`);
                                var userEventList = lodash.map(userEventListWrapper, (event) => {
                                    return event.data;
                                });
                                var userEvent = {
                                    content: userEventList,
                                    position: userPos
                                };

                                try {
                                    //this._executeUserFunction("userEventLogic", loggerUserEvent, this._userEventLogic, userEvent);
                                    this._userEventLogic?.call(this._gameThis, require, loggerUserEvent, this._scene, this._gameState, userEvent);
                                } catch (ex) {
                                    throw new Error(`User Event Excepion: ${ex.message}`);
                                }

                            } else {
                                console.log(`Could not find user: ${event?.connectionId}`);
                            }
                        }

                        // --- Loop step logic
                        try {
                            //this._executeUserFunction("gameLoopLogic", loggerLoop, this._gameLoopLogic);
                            this._gameLoopLogic?.call(this._gameThis, require, loggerLoop, this._scene, this._gameState);
                        } catch (ex) {
                            throw new Error(`Game Loop Excepion: ${ex.message}`);
                        }

                        // ---

                        this._gameState.breakActive = this._gameThis.breakActive;
                        // ---

                        //clearTimeout(loopTimeout);

                        this._loopMetrics.logs = this._logFactory.takeLogs();

                        this._gameStepObservable?.next(this._gameState);
                        this._metricsObservable?.next(this._loopMetrics);

                    } catch (ex) {
                        var logs = this._logFactory.takeLogs();
                        this._metricsObservable?.next({ error: ex.message, logs: logs });
                        this._gameStepObservable?.error({ error: ex.message });
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
            this._gameState = {};
            this._userList = {};
            this._nextPos = 0;
            this._userEventQueue = [];
            this._gameThis = { breakActive: false, _isStepComplete: false };

            this._loopActive = false;
            this._endLoop.next(".");
            this._endMetrics.next(".");

            resolve(content);
        });
    }

    queueNewUser(connectionIdIn: string, content: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {

                for (const connectionId in this._userList) {
                    if (connectionId == connectionIdIn) {
                        console.log(`## Existing USER ${connectionIdIn}, pos: ${this._userList[connectionIdIn]} --`);

                        //this._newUserList.push(this._userList[connectionIdIn]);
                        resolve(JSON.stringify({ position: this._userList[connectionIdIn] }));
                        return;
                    }
                }

                var nextPos = this._nextPos;
                this._nextPos++;

                console.log(`### NEW USER [${connectionIdIn}]: ${content}, pos: ${nextPos}`);

                this._loopMetrics.lastActive = new Date().getTime();

                this._userList[connectionIdIn] = nextPos;
                this._newUserList.push(nextPos);

                resolve(JSON.stringify({ position: this._userList[connectionIdIn] }));

            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }

    exitUser(connectionIdIn: string, content: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {

                console.log(`### USER EXITED [${connectionIdIn}]: ${content} ###`);

                for (const connectionId in this._userList) {
                    if (connectionId == connectionIdIn) {

                        this._exitedUserList.push(this._userList[connectionIdIn]);

                        delete this._userList[connectionIdIn];

                        var userCount = 0;
                        for (const pos in this._userList) {
                            userCount++;
                        }

                        console.log(`Removing existing connection ${connectionIdIn}, new user count: ${userCount}`);
                    }
                }

                resolve(content);
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    }

    queueUserEvent(data: any) {
        try {
            this._loopMetrics.lastActive = new Date().getTime();
            this._userEventQueue.push(data)
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