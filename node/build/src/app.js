"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const inversify_config_1 = require("./inversify.config");
const types_1 = require("./components/types");
const appInsights = require("applicationinsights");
appInsights.setup(process.env.APPLICATIONINSIGHTS_KEY)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();
let client = appInsights.defaultClient;
let date = new Date();
client.trackTrace({ message: `Game Container Started ${process.env.environment}` });
// Game Container
//var gameContainer = myContainer.get<GameContainer>(TYPES.GameContainer);
var grpcInterop = inversify_config_1.myContainer.get(types_1.TYPES.GrpcInterop);
grpcInterop.start();
// -- Express
const port = process.env.port || 80;
const app = express_1.default();
app.listen(port);
console.log("Opening Express on port 80");
app.get("/", (req, res) => {
    res.json({
        title: "Test",
        content: "Hello from Game Container!!",
        answerCount: 3
    });
});
//# sourceMappingURL=app.js.map