export interface IBackendApi {
    pushPlayerState(playerPosition: number, state: any): void;
    pushGameState(state: any): void;
    onPlayerEvent(callback: (playerPosition: number, playerState: any) => void): void;
    onGameLoop(callback: () => void): void;
    onPlayerEnter(callback: (playerPosition: number) => void): void;
    onPlayerExit(callback: (playerPosition: number) => void): void;
    onGameStop(callback: () => void): void;
    onGameStart(callback: () => void): void;
}
//# sourceMappingURL=IBackendApi.d.ts.map