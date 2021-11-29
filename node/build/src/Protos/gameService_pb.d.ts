import * as jspb from 'google-protobuf'



export class Document extends jspb.Message {
  getContent(): string;
  setContent(value: string): Document;

  getGameprimaryname(): string;
  setGameprimaryname(value: string): Document;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Document.AsObject;
  static toObject(includeInstance: boolean, msg: Document): Document.AsObject;
  static serializeBinaryToWriter(message: Document, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Document;
  static deserializeBinaryFromReader(message: Document, reader: jspb.BinaryReader): Document;
}

export namespace Document {
  export type AsObject = {
    content: string,
    gameprimaryname: string,
  }
}

export class ConnectedPlayerDocument extends jspb.Message {
  getContent(): string;
  setContent(value: string): ConnectedPlayerDocument;

  getConnectionid(): string;
  setConnectionid(value: string): ConnectedPlayerDocument;

  getGameprimaryname(): string;
  setGameprimaryname(value: string): ConnectedPlayerDocument;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectedPlayerDocument.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectedPlayerDocument): ConnectedPlayerDocument.AsObject;
  static serializeBinaryToWriter(message: ConnectedPlayerDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectedPlayerDocument;
  static deserializeBinaryFromReader(message: ConnectedPlayerDocument, reader: jspb.BinaryReader): ConnectedPlayerDocument;
}

export namespace ConnectedPlayerDocument {
  export type AsObject = {
    content: string,
    connectionid: string,
    gameprimaryname: string,
  }
}

