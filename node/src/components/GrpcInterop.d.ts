import { IGrpcInterop } from "../interfaces/IGrpcInterop";
import { Observable } from 'rxjs';
import { TYPES } from "./types";
import { injectable, inject } from "inversify";

@injectable()
export class GrpcInterop implements IGrpcInterop {

  public static gameContainer: GameContainer;

  start(): void;
}