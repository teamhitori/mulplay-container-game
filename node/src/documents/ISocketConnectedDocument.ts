import { Topic } from  "./Topic";
export interface ISocketConnectedDocument {
    topic: Topic,
    connectionId: string,
    gamePrimaryName: string,
    content: string
  }