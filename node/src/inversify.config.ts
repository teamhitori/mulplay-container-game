import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./components/types";
import { Warrior, Weapon, ThrowableWeapon } from "./interfaces";
import { Ninja, Katana, Shuriken } from "./entities";
import { GameContainer } from "./components/GameContainer";
import { GrpcInterop } from "./components/GrpcInterop";
import { IGrpcInterop } from "./interfaces/IGrpcInterop";
import { IGameContainer } from "./interfaces/IGameContainer";
import { WebSocketService } from "./components/WebSocketService";

const myContainer = new Container();
//myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
//myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
//myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);
var gameContainer = GameContainer;
var grpcInterop = GrpcInterop;
var webSocketService = WebSocketService;
myContainer.bind<WebSocketService>(TYPES.WebSocketService).to(webSocketService);
myContainer.bind<IGameContainer>(TYPES.GameContainer).to(gameContainer);
myContainer.bind<IGrpcInterop>(TYPES.GrpcInterop).to(grpcInterop);

export { myContainer };