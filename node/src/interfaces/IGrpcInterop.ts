import { Observable } from 'rxjs';

export interface IGrpcInterop {

    // onCreateGame(content: string): Promise<string>;
    // onStartGame(content: string): Observable<string>;
    // onStartMetrics(content: string): Observable<string>;
    // onStepGame(content: string): Promise<string>;
    // onDestroyGame(content: string): Promise<string>;
    // onQueueNewUser(content: string): Promise<string>;
    // onQueueUserEvent(binding: Observable<string>): Observable<string>;

    start(): void;
    
}
