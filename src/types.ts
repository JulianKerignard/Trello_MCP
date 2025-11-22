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

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
  pos: number;
  idChecklist: string;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  checkItems: TrelloCheckItem[];
}

export interface TrelloAttachment {
  id: string;
  name: string;
  url: string;
  bytes?: number;
  date: string;
  idMember: string;
  mimeType?: string;
  previews?: Array<{
    id: string;
    scaled: boolean;
    url: string;
    bytes: number;
    height: number;
    width: number;
  }>;
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
  dueComplete?: boolean;
  labels?: TrelloLabel[];
  idMembers?: string[];
  members?: TrelloMember[];
  checklists?: TrelloChecklist[];
  attachments?: TrelloAttachment[];
  dateLastActivity?: string;
  idChecklists?: string[];
  badges?: {
    attachments: number;
    checkItems: number;
    checkItemsChecked: number;
    comments: number;
    description: boolean;
    due?: string | null;
    dueComplete: boolean;
    votes: number;
  };
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
