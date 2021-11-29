import express from 'express';
import { myContainer } from "./inversify.config";
import { TYPES } from "./components/types";
import { IGrpcInterop } from './interfaces/IGrpcInterop';
import { WebSocketService } from './components/WebSocketService'
const appInsights = require("applicationinsights");

appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

let client = appInsights.defaultClient;

let date = new Date();
client.trackTrace({ message: `Game Container Started ${process.env.environment}` });

// Game Container
var webSocketService = myContainer.get<WebSocketService>(TYPES.WebSocketService);
var grpcInterop = myContainer.get<IGrpcInterop>(TYPES.GrpcInterop);

grpcInterop.start();

// -- Express
//const port: string | number = process.env.port || 80;

//const app = express();

////app.listen(port);

//console.log("Opening Express on port 8080");

// app.get("/", (req, res) => {

//     res.json({
//         title: "Test",
//         content: "Hello from Game Container!!",
//         answerCount: 3
//     });
// });

// app.get("/Mulplay.GameService", (req, res) => {

//     res.json({
//         title: "Mulplay.GameService",
//         content: "Hello from Game Container Mulplay.GameService!!",
//         answerCount: 3
//     });
// });

