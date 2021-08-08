import express from 'express';
import { myContainer } from "./inversify.config";
import { TYPES } from "./components/types";
import { IGrpcInterop } from './interfaces/IGrpcInterop';
const appInsights = require("applicationinsights");

appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

let client = appInsights.defaultClient;

let date = new Date();
client.trackTrace({ message: `Game Container Started ${process.env.environment}` });

// Game Container
//var gameContainer = myContainer.get<GameContainer>(TYPES.GameContainer);
var grpcInterop = myContainer.get<IGrpcInterop>(TYPES.GrpcInterop);

grpcInterop.start();

// -- Express
const port: string | number = process.env.port || 80;

const app = express();

app.listen(port);

console.log("Opening Express on port 80");

app.get("/", (req, res) => {

    res.json({
        title: "Test",
        content: "Hello from Game Container!!",
        answerCount: 3
    });
});

