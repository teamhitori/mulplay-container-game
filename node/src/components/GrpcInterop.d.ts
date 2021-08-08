import { IGrpcInterop } from "../interfaces/IGrpcInterop";
import { Observable } from 'rxjs';
import { TYPES } from "./types";
import { injectable, inject } from "inversify";

@injectable()
export class GrpcInterop implements IGrpcInterop {

  // static bindingCreateGame: (content: string) => Promise<string>;
  // static bindingStartGame: (content: string) => Observable<string>;
  // static bindingStartMetrics: (content: string) => Observable<string>;
  // static bindingStepGame: (content: string) => Promise<string>;
  // static bindingDestroyGame: (content: string) => Promise<string>;
  // static bindingQueueNewUser: (content: string) => Promise<string>;
  // static bindingQueueUserEvent: (content: Observable<string>) => Observable<string>;

  //static gameContainer: IGameContainer;

  public static gameContainer: GameContainer;

  start(): void;
}