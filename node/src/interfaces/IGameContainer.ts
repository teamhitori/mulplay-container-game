import { Observable } from "rxjs";

export interface IGameContainer {

    createGame(content: string): Promise<string>;
    startGame(content: any): void;
    startMetrics(content: string): Observable<any>;
    stepGame(content: string): Promise<string>;
    destroyGame(content: string): Promise<string>;
    playerEnter(connectionId: String, content: string): Promise<string>;
    playerEventIn(data: any): void;
    playerExit(connectionIdIn: string, content: string): Promise<string>;
    gameLoop(): Observable<any>;
    playerEvents(): Observable<any>;
}
