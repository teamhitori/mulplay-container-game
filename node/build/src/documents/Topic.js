"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
var Topic;
(function (Topic) {
    Topic[Topic["ping"] = 0] = "ping";
    Topic[Topic["createGame"] = 1] = "createGame";
    Topic[Topic["startGame"] = 2] = "startGame";
    Topic[Topic["restartGame"] = 3] = "restartGame";
    Topic[Topic["metrics"] = 4] = "metrics";
    Topic[Topic["destroyGame"] = 5] = "destroyGame";
    Topic[Topic["playerEnter"] = 6] = "playerEnter";
    Topic[Topic["playerExit"] = 7] = "playerExit";
    Topic[Topic["playerEventIn"] = 8] = "playerEventIn";
    Topic[Topic["playerEventOut"] = 9] = "playerEventOut";
    Topic[Topic["gameLoop"] = 10] = "gameLoop";
    Topic[Topic["gameEnd"] = 11] = "gameEnd";
})(Topic = exports.Topic || (exports.Topic = {}));
//# sourceMappingURL=Topic.js.map