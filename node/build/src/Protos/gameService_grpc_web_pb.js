/**
 * @fileoverview gRPC-Web generated client stub for Mulplay
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.Mulplay = require('./gameService_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.Mulplay.GameServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.Mulplay.GameServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_ping = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/ping',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_ping = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.ping =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/ping',
      request,
      metadata || {},
      methodDescriptor_GameService_ping,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.ping =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/ping',
      request,
      metadata || {},
      methodDescriptor_GameService_ping);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_pingStream = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/pingStream',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_pingStream = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.pingStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/pingStream',
      request,
      metadata || {},
      methodDescriptor_GameService_pingStream);
};


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServicePromiseClient.prototype.pingStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/pingStream',
      request,
      metadata || {},
      methodDescriptor_GameService_pingStream);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_createGame = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/createGame',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_createGame = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.createGame =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/createGame',
      request,
      metadata || {},
      methodDescriptor_GameService_createGame,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.createGame =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/createGame',
      request,
      metadata || {},
      methodDescriptor_GameService_createGame);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_startGame = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/startGame',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_startGame = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.startGame =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/startGame',
      request,
      metadata || {},
      methodDescriptor_GameService_startGame);
};


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServicePromiseClient.prototype.startGame =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/startGame',
      request,
      metadata || {},
      methodDescriptor_GameService_startGame);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_startMetrics = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/startMetrics',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_startMetrics = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.startMetrics =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/startMetrics',
      request,
      metadata || {},
      methodDescriptor_GameService_startMetrics);
};


/**
 * @param {!proto.Mulplay.Document} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServicePromiseClient.prototype.startMetrics =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/startMetrics',
      request,
      metadata || {},
      methodDescriptor_GameService_startMetrics);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_stepGame = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/stepGame',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_stepGame = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.stepGame =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/stepGame',
      request,
      metadata || {},
      methodDescriptor_GameService_stepGame,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.stepGame =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/stepGame',
      request,
      metadata || {},
      methodDescriptor_GameService_stepGame);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_restartGame = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/restartGame',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_restartGame = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.restartGame =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/restartGame',
      request,
      metadata || {},
      methodDescriptor_GameService_restartGame,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.restartGame =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/restartGame',
      request,
      metadata || {},
      methodDescriptor_GameService_restartGame);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_destroyGame = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/destroyGame',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_destroyGame = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.destroyGame =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/destroyGame',
      request,
      metadata || {},
      methodDescriptor_GameService_destroyGame,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.destroyGame =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/destroyGame',
      request,
      metadata || {},
      methodDescriptor_GameService_destroyGame);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.ConnectedPlayerDocument>}
 */
const methodDescriptor_GameService_playerEnter = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/playerEnter',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.Document,
  proto.Mulplay.ConnectedPlayerDocument,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.ConnectedPlayerDocument.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.Document,
 *   !proto.Mulplay.ConnectedPlayerDocument>}
 */
const methodInfo_GameService_playerEnter = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.ConnectedPlayerDocument,
  /**
   * @param {!proto.Mulplay.Document} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.ConnectedPlayerDocument.deserializeBinary
);


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.ConnectedPlayerDocument)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.ConnectedPlayerDocument>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.playerEnter =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/playerEnter',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEnter,
      callback);
};


/**
 * @param {!proto.Mulplay.Document} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.ConnectedPlayerDocument>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.playerEnter =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/playerEnter',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEnter);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_playerExit = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/playerExit',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.ConnectedPlayerDocument,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_playerExit = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.playerExit =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/playerExit',
      request,
      metadata || {},
      methodDescriptor_GameService_playerExit,
      callback);
};


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.playerExit =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/playerExit',
      request,
      metadata || {},
      methodDescriptor_GameService_playerExit);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_playerEventIn = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/playerEventIn',
  grpc.web.MethodType.UNARY,
  proto.Mulplay.ConnectedPlayerDocument,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_playerEventIn = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Mulplay.Document)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>|undefined}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.playerEventIn =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/Mulplay.GameService/playerEventIn',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEventIn,
      callback);
};


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Mulplay.Document>}
 *     Promise that resolves to the response
 */
proto.Mulplay.GameServicePromiseClient.prototype.playerEventIn =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/Mulplay.GameService/playerEventIn',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEventIn);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodDescriptor_GameService_playerEventOut = new grpc.web.MethodDescriptor(
  '/Mulplay.GameService/playerEventOut',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.Mulplay.ConnectedPlayerDocument,
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Mulplay.ConnectedPlayerDocument,
 *   !proto.Mulplay.Document>}
 */
const methodInfo_GameService_playerEventOut = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Mulplay.Document,
  /**
   * @param {!proto.Mulplay.ConnectedPlayerDocument} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Mulplay.Document.deserializeBinary
);


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServiceClient.prototype.playerEventOut =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/playerEventOut',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEventOut);
};


/**
 * @param {!proto.Mulplay.ConnectedPlayerDocument} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Mulplay.Document>}
 *     The XHR Node Readable Stream
 */
proto.Mulplay.GameServicePromiseClient.prototype.playerEventOut =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/Mulplay.GameService/playerEventOut',
      request,
      metadata || {},
      methodDescriptor_GameService_playerEventOut);
};


module.exports = proto.Mulplay;

