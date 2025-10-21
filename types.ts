export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  role: MessageRole;
  text: string;
  sources?: Source[];
  image?: string; // Data URL for the image
}

export interface UserData {
    name: string;
    age: string;
    dob: string;
    isInvestor: boolean;
}
