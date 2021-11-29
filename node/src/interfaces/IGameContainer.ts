import { Observable } from "rxjs";

export interface IGameContainer {

    createGame(content: string): Promise<string>;
    startGame(content: any): void;
    startMetrics(content: string): Observable<any>;
    stepGame(content: string): Promise<string>;
    destroyGame(content: string): Promise<boolean>;
    playerEnter(connectionId: String, content: string): Promise<string>;
    playerEventIn(connectionId: String, content: string): void;
    playerExit(connectionIdIn: string): Promise<string>;
    gameLoop(): Observable<any>;
    playerEvents(): Observable<any>;
}
