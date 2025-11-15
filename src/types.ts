/**
 * Trello API Types
 */

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
  idOrganization?: string;
  prefs?: {
    permissionLevel: string;
    background: string;
  };
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idList: string;
  idBoard: string;
  url: string;
  shortUrl: string;
  due?: string | null;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  idMembers?: string[];
}

export interface TrelloComment {
  id: string;
  type: string;
  date: string;
  data: {
    text: string;
    card?: {
      id: string;
      name: string;
    };
  };
  memberCreator: {
    id: string;
    fullName: string;
    username: string;
  };
}

export interface TrelloAPIError {
  message: string;
  error: string;
}

export interface TrelloSearchResult {
  cards: TrelloCard[];
  options: {
    modelTypes: string[];
  };
}

export type CardPosition = 'top' | 'bottom' | number;
