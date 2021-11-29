import { inject, injectable } from "inversify";
import WebSocket, { WebSocketServer } from 'ws';
import * as http2 from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { IGameContainer } from "../interfaces/IGameContainer";
import { ISocketConnectedDocument } from "../documents/ISocketConnectedDocument"
import { Topic } from "../documents/Topic";
import { GameContainer } from "./GameContainer";
import * as appInsights from 'applicationinsights';
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { readFileSync } from 'fs';

@injectable()
export class WebSocketService {

  private _containers: { [name: string]: IGameContainer } = {};
  private _client: appInsights.TelemetryClient;
  private _connections: { [name: string]: WebSocket } = {};
  private _connectionGame: { [name: string]: string } = {};
  private _gameCreator: { [name: string]: string } = {};

  metricsSub?: Subscription

  constructor() {
    appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    this._client = appInsights.defaultClient;

    this._initWebsocket();
  }

  private _initWebsocket() {
    try {

      // const server = http2.createSecureServer({
      //   key: readFileSync('/data/front-proxy-key.pem'),
      //   cert: readFileSync('/data/front-proxy-crt.pem')
      // });

      const server = http2.createServer( () => {});

      //const wss = new WebSocketServer({ noServer: true });
      const wss = new WebSocketServer({ port: 8080 });

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


      console.log(`Starting server on port 8080`)
      // server.listen(8080,  () => {
      //   console.log(`listen server on port 8080`)
      // });


      wss.on('connection', (ws) => {
        try {
          var connectionId = uuidv4();

          this._connections[connectionId] = ws;

          var gameLoopSub: Subscription | undefined = undefined;
          var playerEventOutSub: Subscription | undefined = undefined;
          var metricsSub: Subscription | undefined = undefined;

          console.log(`new connectionId: ${connectionId}, url: ${ws.url}`);

          ws.on('message', (event) => {
            try {

              var doc = JSON.parse(event.toString()) as ISocketConnectedDocument
              //console.log(`message topic: ${Topic[doc.topic]}, connectionId: ${connectionId}`);

              switch (doc.topic) {
                case Topic.ping:
                  ws.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.ping, content: `Pong ${doc.content}` }));
                  break;
                case Topic.createGame:
                  this._createGame(connectionId, doc);
                  break;
                case Topic.startGame:
                  gameLoopSub?.unsubscribe();
                  metricsSub?.unsubscribe();
                  playerEventOutSub?.unsubscribe();
                  gameLoopSub = this._startGame(connectionId, doc, ws);
                  metricsSub = this._startMetrics(doc, ws);
                  playerEventOutSub = this._startPlayerEvent(connectionId, doc, ws);
                  break;
                case Topic.destroyGame:
                  this._destroyGame(connectionId, doc, ws);
                  break;
                case Topic.playerEnter:
                  this._playerEnter(connectionId, doc);
                  break;
                case Topic.playerExit:
                  this._playerExit(connectionId, doc);
                  break;
                case Topic.playerEventIn:
                  this._playerEventIn(connectionId, doc);
                  break;
              }
            } catch (ex: any) {
              console.log(ex);
              this._client.trackException({ exception: ex });
            }
          });

          ws.on('close', (event) => {

            console.log(`Close Event connectionId:${connectionId}`, event);

            const gamePrimaryName = this._connectionGame[connectionId];

            if(gamePrimaryName) {
              this._playerExit(connectionId, <ISocketConnectedDocument>{gamePrimaryName: gamePrimaryName})
            }

            
            delete this._connections[connectionId];
            delete this._connectionGame[connectionId];

          });

        } catch (ex: any) {
          console.log(ex);
          this._client.trackException({ exception: ex });
        }
      });
    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }
  }

  private _createGame(connectionId: string, request: ISocketConnectedDocument) {
    try {

      console.log(`createGame called. gamePrimaryName:${request.gamePrimaryName}, connectionId: ${connectionId}`);

      if (!this._containers[request.gamePrimaryName]) {
        this._containers[request.gamePrimaryName] = new GameContainer();
      }

      this._gameCreator[request.gamePrimaryName] = connectionId;

      this._containers[request.gamePrimaryName]?.createGame.call(this._containers[request.gamePrimaryName], request.content)
        .then(_ => {
        }).catch(ex => {
          console.log(ex);
          this._client.trackException({ exception: ex });
        });

    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }
  }

  private _startGame(connectionId: string, request: ISocketConnectedDocument, ws: WebSocket): Subscription | undefined {
    try {
      console.log(`startGame called. gamePrimaryName:${request.gamePrimaryName}, connectionId: ${connectionId}`);

      this._connectionGame[connectionId] = request.gamePrimaryName;
      this._containers[request.gamePrimaryName]?.startGame.call(this._containers[request.gamePrimaryName], request);

      return this._containers[request.gamePrimaryName]?.gameLoop.call(this._containers[request.gamePrimaryName])
        .subscribe({
          next: content => {
            var contentStr = JSON.stringify(content);
            ws.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.gameLoop, content: contentStr }));

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

    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

    return undefined;
  }

  private _startMetrics(request: ISocketConnectedDocument, ws: WebSocket): Subscription | undefined {
    try {

      console.log(`startMetrics called. gamePrimaryName:${request.gamePrimaryName}`);

      return this._containers[request.gamePrimaryName]?.startMetrics.call(this._containers[request.gamePrimaryName], request.content)
        .subscribe({
          next: content => {
            ws.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.metrics, content: content }));
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

    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

    return undefined;
  }

  private _startPlayerEvent(connectionId: string, request: ISocketConnectedDocument, ws: WebSocket): Subscription | undefined {
    try {

      console.log(`startPlayerEvent called.  gamePrimaryName:${request.gamePrimaryName}, connectionId:${connectionId}`);

      return this._containers[request.gamePrimaryName]?.playerEvents.call(this._containers[request.gamePrimaryName])
        .pipe(filter(message => {
          var res = message.connectionId == connectionId;
          return res;
        }))
        .subscribe({
          next: message => {
            var contentStr = JSON.stringify(message.state);
            ws.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.playerEventOut, content: contentStr }));
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

    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }
  }

  private _destroyGame(connectionId: string, request: ISocketConnectedDocument, ws: WebSocket) {
    try {

      console.log(`destroyGame called, gamePrimaryName:${request.gamePrimaryName}, conectionId:${connectionId}`);
      if (this._gameCreator[request.gamePrimaryName] != connectionId) {
        console.log(`This connection: conectionId:${connectionId} cannot destroy game: request.gamePrimaryName, created by: ${this._gameCreator[request.gamePrimaryName]}`);
        return;
      }

      var _this = this;

      this._containers[request.gamePrimaryName]?.destroyGame.call(
        this._containers[request.gamePrimaryName],
        request.content)
        .then(isMaterialDestroy => {
          if (!isMaterialDestroy) return;
          for (const connectionId in _this._connectionGame) {
            if (Object.prototype.hasOwnProperty.call(_this._connectionGame, connectionId)) {
              const gamePrimaryName = _this._connectionGame[connectionId];

              if (gamePrimaryName == request.gamePrimaryName) {
                var socket = _this._connections[connectionId];

                console.log(`Sending GameExit to connectionId:${connectionId}`)

                socket?.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.gameEnd }));
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

          ws.send(JSON.stringify(<ISocketConnectedDocument>{ topic: Topic.destroyGame }));
        });
    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

  }

  private _playerEnter(connectionId: string, request: ISocketConnectedDocument) {
    try {
      this._containers[request.gamePrimaryName]?.playerEnter.call(
        this._containers[request.gamePrimaryName],
        connectionId,
        request.content)
        .then(_ => {

        })
        .catch(ex => {
          console.log(ex);
          this._client.trackException({ exception: ex });
        });
    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

  }

  private _playerExit(connectionId: string, request: ISocketConnectedDocument) {
    try {
      console.log(`userExit called. connectionId:${request?.connectionId}, gamePrimaryName:${request.gamePrimaryName}`);

      this._containers[request.gamePrimaryName]?.playerExit.call(
        this._containers[request.gamePrimaryName],
        connectionId)
        .then(content => {

        })
        .catch(ex => {
          console.log(ex);
          this._client.trackException({ exception: ex });
        });
    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

  }

  private _playerEventIn(connectionId: string, request: ISocketConnectedDocument) {
    try {

      this._containers[request.gamePrimaryName]?.playerEventIn.call(this._containers[request.gamePrimaryName], connectionId, request.content);

    } catch (ex: any) {
      console.log(ex);
      this._client.trackException({ exception: ex });
    }

  }
}