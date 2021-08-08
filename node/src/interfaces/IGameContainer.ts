import { Observable } from "rxjs";

export interface IGameContainer {

    createGame(content: string): Promise<string>;
    startGame(content: any): Observable<any>;
    startMetrics(content: string): Observable<string>;
    stepGame(content: string): Promise<string>;
    destroyGame(content: string): Promise<string>;
    queueNewUser(connectionId: String, content: string): Promise<string>;
    queueUserEvent(data: any): void;
    exitUser(connectionIdIn: string, content: string): Promise<string>;
}
