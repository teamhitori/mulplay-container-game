import { IGameConfig } from "./IGameConfig";

export interface IGameDefinition {
  gameName: string;
  frontendLogic: string;
  backendLogic: string;
  gameConfig: IGameConfig;
  isPublished: boolean;
  publishedPath: string;
}