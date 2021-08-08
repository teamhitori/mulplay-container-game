"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myContainer = void 0;
const inversify_1 = require("inversify");
require("reflect-metadata");
const types_1 = require("./components/types");
const GameContainer_1 = require("./components/GameContainer");
const GrpcInterop_1 = require("./components/GrpcInterop");
const myContainer = new inversify_1.Container();
exports.myContainer = myContainer;
//myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
//myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
//myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);
var gameContainer = GameContainer_1.GameContainer;
var grpcInterop = GrpcInterop_1.GrpcInterop;
myContainer.bind(types_1.TYPES.GameContainer).to(gameContainer);
myContainer.bind(types_1.TYPES.GrpcInterop).to(grpcInterop);
//# sourceMappingURL=inversify.config.js.map