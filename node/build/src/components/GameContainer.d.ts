import { Observable } from 'rxjs';
import { IGameContainer } from "../interfaces/IGameContainer";
export declare class GameContainer implements IGameContainer {
    private _endLoop;
    private _endMetrics;
    private _gameStepObservable?;
    private _metricsObservable?;
    private _loopMetrics;
    private _loopActive;
    private _gameDefinition?;
    private _gameLoopLogic?;
    private _startLogic?;
    private _userEnterLogic?;
    private _userEventLogic?;
    private _userExitLogic?;
    private _gameState;
    private _userList;
    private _nextPos;
    private _newUserList;
    private _exitedUserList;
    private _userEventQueue;
    private _gameThis;
    private _scene;
    private _logFactory;
    constructor();
    createGame(content: string): Promise<string>;
    startGame(contentIn: any): Observable<any>;
    _startGameLoop(): void;
    startMetrics(_: string): Observable<string>;
    stepGame(content: string): Promise<string>;
    destroyGame(content: string): Promise<string>;
    queueNewUser(connectionIdIn: string, content: string): Promise<string>;
    exitUser(connectionIdIn: string, content: string): Promise<string>;
    queueUserEvent(data: any): void;
}
//# sourceMappingURL=GameContainer.d.ts.map