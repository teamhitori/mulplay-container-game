"use strict";
const fs = require("fs");
const grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const rx = require('rxjs');
const operators = require('rxjs/operators');
const BABYLON = require('babylonjs');
const inv = require("inversify");
const appInsights = require("applicationinsights");
import { TYPES } from "./types";
import { GameContainer } from './GameContainer';

appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

let client = appInsights.defaultClient;

var cl = console.log;
console.log = (...args) => {
    var message = `mulplay-container-game[${process.env.environment}]: `;
    for (var arg in args) {
        message += ` ${args[arg]}`;
    }
    client.trackTrace({ message: message });
    cl.apply(console, args);
}


@inv.injectable()
export class GrpcInterop {

    start() {

        fs.readdir(".", (err, files) => {
            files.forEach(file => {
                console.log(file);
            });
        });

        const PROTO_FILE = `${__dirname}/../Protos/gameService.proto`;

        // Suggested options for similarity to existing grpc.load behavior
        var packageDefinition = protoLoader.loadSync(
            PROTO_FILE,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

        const port = 8080;
        const server = new grpc.Server();

        const state = {
            ping: GrpcInterop.ping,
            createGame: GrpcInterop.createGame,
            startGame: GrpcInterop.startGame,
            restartGame: GrpcInterop.restartGame,
            startMetrics: GrpcInterop.startMetrics,
            stepGame: GrpcInterop.stepGame,
            destroyGame: GrpcInterop.destroyGame,
            queueNewUser: GrpcInterop.queueNewUser,
            exitUser: GrpcInterop.exitUser,
            queueUserEvent: GrpcInterop.queueUserEvent,
            gameContainers: {}
        }

        console.log(`Game Instance Created on port ${port}`);
        console.log(protoDescriptor);

        server.addService(protoDescriptor.Mulplay.GameService.service, state);

        server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
            server.start();
            console.log(`Server starting on port ${port}`);
        });
    }

    static createGame(call, callback) {
        try {
            console.log(`createGame called, ${call.request?.connectionId}`);

            if (!this.gameContainers[call.request.gamePrimaryName]) {
                this.gameContainers[call.request.gamePrimaryName] = new GameContainer();
            }

            //console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.createGame.call(this.gameContainers[call.request.gamePrimaryName], call.request.content)
                .then(content => {
                    callback(null, { content: content });
                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
                });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static startGame(call) {
        try {
            console.log(`[startGame called] connectionId:${call.request?.connectionId}, gamePrimaryName:${call.request.gamePrimaryName}`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.startGame.call(this.gameContainers[call.request.gamePrimaryName], call.request)
                .subscribe({
                    next: content => {
                        var contentStr = JSON.stringify(content);
                        call.write({ content: contentStr });
                        //console.log(call.request?.connectionId, contentStr);
                    },
                    error: ex => {
                        console.log(ex);
                        console.log("Error Loop Ending");
                        call.end();
                        client.trackException({ exception: ex });
                    },
                    complete: () => {
                        console.log("Loop Ending");
                        call.end();
                    }
                });
        }
        catch (ex) {
            console.log(ex);
            call.end();
            client.trackException({ exception: ex });
        }
    }

    static startMetrics(call) {
        try {
            console.log(`startMetrics called, ${call.request?.connectionId}`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.startMetrics.call(this.gameContainers[call.request.gamePrimaryName], call.request.content)
                .subscribe({
                    next: content => {
                        call.write({ content: content });
                    },
                    error: ex => {
                        console.log(ex);
                        call.write(ex);
                        console.log("Error Metrics Ending");
                        call.end();
                        client.trackException({ exception: ex });
                    },
                    complete: () => {
                        console.log("Metrics Ending");
                        call.end();
                    }
                });
        }
        catch (ex) {
            console.log(ex);
            call.write(ex);
            call.end();
            client.trackException({ exception: ex });
        }
    }

    static restartGame(call, callback) {
        try {
            console.log("restartGame called");
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.startGame.call(this.gameContainers[call.request.gamePrimaryName], call.request);

            callback(null, { content: "" });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static stepGame(call, callback) {
        try {
            console.log("stepGame called");
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.stepGame.call(this.gameContainers[call.request.gamePrimaryName], call.request.content)
                .then(content => {
                    callback(null, { content: content });
                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
                });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static destroyGame(call, callback) {
        try {
            console.log("destroyGame called");
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.destroyGame.call(
                this.gameContainers[call.request.gamePrimaryName], 
                call.request.content)
                .then(content => {
                    callback(null, { content: content });
                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
                });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static ping(call, callback) {
        try {
            console.log("ping called");
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            callback(null, { content: "pong" });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static queueNewUser(call, callback) {
        try {
            console.log(`queueNewUser called, ${call.request?.connectionId}`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.queueNewUser.call(
                this.gameContainers[call.request.gamePrimaryName], 
                call.request.connectionId, 
                call.request.content)
                .then(content => {
                    callback(null, { connectionId: call.request.connectionId, content: content });
                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
                });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static exitUser(call, callback) {
        try {
            console.log("userExit called");
            
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.exitUser.call(
                this.gameContainers[call.request.gamePrimaryName], 
                call.request.connectionId, 
                call.request.content)
                .then(content => {
                    callback(null, { content: content });
                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
                });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static queueUserEvent(call) {
        try {
            console.log(`queueUserEvent called, ${call.request?.connectionId}`);
            //var content = JSON.parse(call.request.content);
            //console.log(content);
            //var onUserEvent = new rx.Subject();
            call.on('data', (data) => {
                try {

                    // Process user data
                    //console.log(`queueUserEvent ${data.connectionId}`);

                    this.gameContainers[data.gamePrimaryName]?.queueUserEvent.call(this.gameContainers[data.gamePrimaryName], data);
                }
                catch (ex) {
                    onUserEvent.error();
                    console.log(ex);
                    call.write(ex);
                    call.end();
                    client.trackException({ exception: ex });
                }
            });
            
        }
        catch (ex) {
            console.log(ex);
            call.write(ex);
            call.end();
            client.trackException({ exception: ex });
        }
    }
}
