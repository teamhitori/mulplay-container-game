"use strict";
const fs = require("fs");
const grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const BABYLON = require('babylonjs');
const inv = require("inversify");
const appInsights = require("applicationinsights");
import { TYPES } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { GameContainer } from './GameContainer';
import { filter } from 'rxjs/operators';


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

        const port = 8081;
        const server = new grpc.Server();

        const state = {
            ping: GrpcInterop.ping,
            pingStream: GrpcInterop.pingStream,
            createGame: GrpcInterop.createGame,
            startGame: GrpcInterop.startGame,
            restartGame: GrpcInterop.restartGame,
            startMetrics: GrpcInterop.startMetrics,
            stepGame: GrpcInterop.stepGame,
            destroyGame: GrpcInterop.destroyGame,
            playerEnter: GrpcInterop.playerEnter,
            playerExit: GrpcInterop.playerExit,
            playerEventInStream: GrpcInterop.playerEventInStream,
            playerEventIn: GrpcInterop.playerEventIn,
            playerEventOut: GrpcInterop.playerEventOut,
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
            console.log(`createGame called. gamePrimaryName:${call.request.gamePrimaryName}`);

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
            console.log(`startGame called. gamePrimaryName:${call.request.gamePrimaryName}`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);
            this.gameContainers[call.request.gamePrimaryName]?.startGame.call(this.gameContainers[call.request.gamePrimaryName], call.request);

            this.gameContainers[call.request.gamePrimaryName]?.gameLoop.call(this.gameContainers[call.request.gamePrimaryName])
                .subscribe({
                    next: content => {
                        var contentStr = JSON.stringify(content);
                        call.write({ content: contentStr });
                        //console.log(call.request?.connectionId, contentStr);
                    },
                    error: ex => {
                        console.log(ex);
                        console.log(`Error Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
                        call.end();
                        client.trackException({ exception: ex });
                    },
                    complete: () => {
                        console.log(`Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
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
            console.log(`startMetrics called. gamePrimaryName:${call.request.gamePrimaryName}`);
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
                        console.log(`Error Metrics Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
                        call.end();
                        client.trackException({ exception: ex });
                    },
                    complete: () => {
                        console.log(`Metrics Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
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
            console.log(`restartGame called. gamePrimaryName:${call.request.gamePrimaryName}`);
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
            console.log(`stepGame called, gamePrimaryName:${call.request.gamePrimaryName}`);
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
            console.log(`destroyGame called, gamePrimaryName:${call.request.gamePrimaryName}`);
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
            console.log(call.request.content);
            callback(null, { content: `pong: ${call.request.content}` });
        }
        catch (ex) {
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static pingStream(call) {
        try {
            console.log(`pingStream called.`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);

            call.write({ content: "Pong" });
            call.write({ content: "Pong" });
            call.write({ content: "Pong" });
            call.write({ content: "Pong" });
            call.write({ content: "Pong" });

            call.end();
        }
        catch (ex) {
            console.log(ex);
            call.end();
            client.trackException({ exception: ex });
        }
    }

    static playerEnter(call, callback) {
        try {

            var connectionId = uuidv4();

            console.log(`playerEnter called. new connectionId:${connectionId}, gamePrimaryName:${call.request.gamePrimaryName}`);

            // additional logic to ensure connectionId is valid

            callback(null, { connectionId: connectionId });


        }
        catch (ex) {
            console.log(ex);
            call.write(ex);
            client.trackException({ exception: ex });
        }
    }

    static playerExit(call, callback) {
        try {
            console.log(`userExit called. connectionId:${call.request?.connectionId}, gamePrimaryName:${call.request.gamePrimaryName}`);

            this.gameContainers[call.request.gamePrimaryName]?.playerExit.call(
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

    static playerEventInStream(call) {
        try {
            //console.log(`queueUserEvent called`);
            //var content = JSON.parse(call.request.content);
            //console.log(content);
            //var onUserEvent = new rx.Subject();
            call.on('data', (data) => {
                try {

                    // Process user data
                    //console.log(`queueUserEvent ${data.connectionId}`);

                    this.gameContainers[data.gamePrimaryName]?.playerEventIn.call(this.gameContainers[data.gamePrimaryName], data);
                }
                catch (ex) {
                    onUserEvent.error();
                    console.log(ex);
                    call.write(ex);
                    call.end();
                    client.trackException({ exception: ex });
                }
            });

            // this.gameContainers[call.request.gamePrimaryName]?.userEvents.call()
            //     .subscribe({
            //         next: content => {
            //             var contentStr = JSON.stringify(content.state);
            //             call.write({ connectionId: content.connectionId, content: contentStr });
            //             //console.log(call.request?.connectionId, contentStr);
            //         },
            //         error: ex => {
            //             console.log(ex);
            //             console.log(`Error User event Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
            //             call.end();
            //             client.trackException({ exception: ex });
            //         },
            //         complete: () => {
            //             console.log(`User event Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
            //             call.end();
            //         }
            //     });

        }
        catch (ex) {
            console.log(ex);
            call.write(ex);
            call.end();
            client.trackException({ exception: ex });
        }
    }

    static playerEventIn(call, callback) {
        console.log(`queueUserEvent called`);
        //var content = JSON.parse(call.request.content);
        //console.log(content);
        //var onUserEvent = new rx.Subject();
        try {

            // Process user call.request
            //console.log(`queueUserEvent ${call.request.connectionId}`);

            this.gameContainers[call.request.gamePrimaryName]?.playerEventIn.call(this.gameContainers[call.request.gamePrimaryName], call.request);

            callback(null, {  });
        }
        catch (ex) {
            onUserEvent.error();
            console.log(ex);
            callback(ex, null);
            client.trackException({ exception: ex });
        }
    }

    static playerEventOut(call) {
        try {
            console.log(`playerEventOut called.  gamePrimaryName:${call.request.gamePrimaryName}, connectionId:${call.request.connectionId}`);
            //var content = JSON.parse(call.request.content);
            console.log(call.request.content);

            this.gameContainers[call.request.gamePrimaryName]?.playerEvents.call(this.gameContainers[call.request.gamePrimaryName])
                .pipe(filter(message => {
                    var res = message.connectionId == call.request.connectionId;
                    return res;
                }))
                .subscribe({
                    next: message => {
                        var contentStr = JSON.stringify(message.state);
                        call.write({ content: contentStr });
                    },
                    error: ex => {
                        console.log(ex);
                        console.log(`Error User event Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
                        call.end();
                        client.trackException({ exception: ex });
                    },
                    complete: () => {
                        console.log(`User event Loop Ending, gamePrimaryName:${call.request.gamePrimaryName}`);
                        call.end();
                    }
                });

            this.gameContainers[call.request.gamePrimaryName]?.playerEnter.call(
                this.gameContainers[call.request.gamePrimaryName],
                call.request.connectionId,
                call.request.content)
                .then(_ => {

                })
                .catch(ex => {
                    console.log(ex);
                    callback(ex, null);
                    client.trackException({ exception: ex });
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
