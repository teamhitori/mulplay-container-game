import * as grpcWeb from 'grpc-web';

import * as gameService_pb from './gameService_pb';


export class GameServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  ping(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  pingStream(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  createGame(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  startGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  startMetrics(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  stepGame(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  restartGame(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  destroyGame(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  playerEnter(
    request: gameService_pb.Document,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.ConnectedPlayerDocument) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.ConnectedPlayerDocument>;

  playerExit(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  playerEventIn(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: gameService_pb.Document) => void
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  playerEventOut(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

}

export class GameServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  ping(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  pingStream(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  createGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  startGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  startMetrics(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

  stepGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  restartGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  destroyGame(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  playerEnter(
    request: gameService_pb.Document,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.ConnectedPlayerDocument>;

  playerExit(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  playerEventIn(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata?: grpcWeb.Metadata
  ): Promise<gameService_pb.Document>;

  playerEventOut(
    request: gameService_pb.ConnectedPlayerDocument,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<gameService_pb.Document>;

}

