/**
 * Unit tests for TrelloClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { TrelloClient } from './trello-client.js';
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  TrelloMember
} from './types.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('TrelloClient', () => {
  let client: TrelloClient;
  const mockApiKey = 'test-api-key';
  const mockApiToken = 'test-api-token';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    mockedAxios.create = vi.fn(() => mockAxiosInstance as any);

    client = new TrelloClient(mockApiKey, mockApiToken);
  });

  describe('Constructor', () => {
    it('should throw error if API key is missing', () => {
      expect(() => new TrelloClient('', mockApiToken)).toThrow('Trello API credentials manquants');
    });

    it('should throw error if API token is missing', () => {
      expect(() => new TrelloClient(mockApiKey, '')).toThrow('Trello API credentials manquants');
    });

    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.trello.com/1',
        timeout: 30000,
        params: {
          key: mockApiKey,
          token: mockApiToken
        }
      });
    });
  });

  describe('Board Operations', () => {
    it('should get boards', async () => {
      const mockBoards: TrelloBoard[] = [
        { id: '1', name: 'Board 1', desc: '', url: 'https://trello.com/b/1', closed: false },
        { id: '2', name: 'Board 2', desc: '', url: 'https://trello.com/b/2', closed: false }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockBoards });

      const result = await client.getBoards();

      expect(mockInstance.get).toHaveBeenCalledWith('/members/me/boards', {
        params: { fields: 'id,name,desc,url,closed' }
      });
      expect(result).toEqual(mockBoards);
    });

    it('should create board', async () => {
      const mockBoard: TrelloBoard = {
        id: '1',
        name: 'New Board',
        desc: 'Description',
        url: 'https://trello.com/b/1',
        closed: false
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockBoard });

      const result = await client.createBoard('New Board', 'Description');

      expect(mockInstance.post).toHaveBeenCalledWith('/boards', {
        name: 'New Board',
        desc: 'Description',
        defaultLists: false
      });
      expect(result).toEqual(mockBoard);
    });

    it('should get board by ID', async () => {
      const mockBoard: TrelloBoard = {
        id: '123',
        name: 'Test Board',
        desc: '',
        url: 'https://trello.com/b/123',
        closed: false
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockBoard });

      const result = await client.getBoard('123');

      expect(mockInstance.get).toHaveBeenCalledWith('/boards/123');
      expect(result).toEqual(mockBoard);
    });

    it('should close board', async () => {
      const mockBoard: TrelloBoard = {
        id: '123',
        name: 'Test Board',
        desc: '',
        url: 'https://trello.com/b/123',
        closed: true
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockBoard });

      const result = await client.closeBoard('123');

      expect(mockInstance.put).toHaveBeenCalledWith('/boards/123', { closed: true });
      expect(result.closed).toBe(true);
    });

    it('should reopen board', async () => {
      const mockBoard: TrelloBoard = {
        id: '123',
        name: 'Test Board',
        desc: '',
        url: 'https://trello.com/b/123',
        closed: false
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockBoard });

      const result = await client.reopenBoard('123');

      expect(mockInstance.put).toHaveBeenCalledWith('/boards/123', { closed: false });
      expect(result.closed).toBe(false);
    });

    it('should delete board', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.delete.mockResolvedValue({ data: {} });

      await client.deleteBoard('123');

      expect(mockInstance.delete).toHaveBeenCalledWith('/boards/123');
    });
  });

  describe('List Operations', () => {
    it('should get lists', async () => {
      const mockLists: TrelloList[] = [
        { id: '1', name: 'To Do', idBoard: 'board1', closed: false, pos: 1 },
        { id: '2', name: 'Done', idBoard: 'board1', closed: false, pos: 2 }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockLists });

      const result = await client.getLists('board1');

      expect(mockInstance.get).toHaveBeenCalledWith('/boards/board1/lists', {
        params: { fields: 'id,name,idBoard,closed,pos' }
      });
      expect(result).toEqual(mockLists);
    });

    it('should create list', async () => {
      const mockList: TrelloList = {
        id: '1',
        name: 'New List',
        idBoard: 'board1',
        closed: false,
        pos: 1
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockList });

      const result = await client.createList('board1', 'New List');

      expect(mockInstance.post).toHaveBeenCalledWith('/lists', {
        name: 'New List',
        idBoard: 'board1'
      });
      expect(result).toEqual(mockList);
    });
  });

  describe('Card Operations', () => {
    it('should get cards from list', async () => {
      const mockCards: TrelloCard[] = [
        {
          id: '1',
          name: 'Card 1',
          desc: 'Description',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/1',
          shortUrl: 'https://trello.com/c/1',
          closed: false,
          due: null,
          labels: []
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCards });

      const result = await client.getCards('list1');

      expect(mockInstance.get).toHaveBeenCalledWith('/lists/list1/cards');
      expect(result).toEqual(mockCards);
    });

    it('should create card', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'New Card',
        desc: 'Card description',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockCard });

      const result = await client.createCard('list1', 'New Card', 'Card description');

      expect(mockInstance.post).toHaveBeenCalledWith('/cards', {
        idList: 'list1',
        name: 'New Card',
        desc: 'Card description'
      });
      expect(result).toEqual(mockCard);
    });

    it('should update card', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Updated Card',
        desc: 'Updated description',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.updateCard('1', { name: 'Updated Card' });

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { name: 'Updated Card' });
      expect(result).toEqual(mockCard);
    });

    it('should archive card', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Archived Card',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: true,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.archiveCard('1');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { closed: true });
      expect(result.closed).toBe(true);
    });

    it('should unarchive card', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Unarchived Card',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.unarchiveCard('1');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { closed: false });
      expect(result.closed).toBe(false);
    });

    it('should delete card', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.delete.mockResolvedValue({});

      await client.deleteCard('1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/cards/1');
    });

    it('should move card', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Moved Card',
        desc: '',
        idList: 'list2',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.moveCard('1', 'list2', 'bottom');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', {
        idList: 'list2',
        pos: 'bottom'
      });
      expect(result.idList).toBe('list2');
    });

    it('should search cards', async () => {
      const mockCards: TrelloCard[] = [
        {
          id: '1',
          name: 'Search Result',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/1',
          shortUrl: 'https://trello.com/c/1',
          closed: false,
          due: null,
          labels: []
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: { cards: mockCards } });

      const result = await client.searchCards('test query');

      expect(mockInstance.get).toHaveBeenCalledWith('/search', {
        params: {
          query: 'test query',
          modelTypes: 'cards',
          cards_limit: 25,
          card_fields: 'id,name,desc,idList,idBoard,url,shortUrl,closed,due,labels'
        }
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe('Label Operations', () => {
    it('should get labels', async () => {
      const mockLabels: TrelloLabel[] = [
        { id: '1', name: 'Priority', color: 'red', idBoard: 'board1' },
        { id: '2', name: 'Bug', color: 'orange', idBoard: 'board1' }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockLabels });

      const result = await client.getLabels('board1');

      expect(mockInstance.get).toHaveBeenCalledWith('/boards/board1/labels');
      expect(result).toEqual(mockLabels);
    });

    it('should create label', async () => {
      const mockLabel: TrelloLabel = {
        id: '1',
        name: 'New Label',
        color: 'green',
        idBoard: 'board1'
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockLabel });

      const result = await client.createLabel('board1', 'New Label', 'green');

      expect(mockInstance.post).toHaveBeenCalledWith('/boards/board1/labels', {
        name: 'New Label',
        color: 'green'
      });
      expect(result).toEqual(mockLabel);
    });

    it('should update label', async () => {
      const mockLabel: TrelloLabel = {
        id: '1',
        name: 'Updated Label',
        color: 'blue',
        idBoard: 'board1'
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockLabel });

      const result = await client.updateLabel('1', { name: 'Updated Label', color: 'blue' });

      expect(mockInstance.put).toHaveBeenCalledWith('/labels/1', {
        name: 'Updated Label',
        color: 'blue'
      });
      expect(result).toEqual(mockLabel);
    });

    it('should add label to card', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({});

      await client.addLabelToCard('card1', 'label1');

      expect(mockInstance.post).toHaveBeenCalledWith('/cards/card1/idLabels', {
        value: 'label1'
      });
    });

    it('should remove label from card', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.delete.mockResolvedValue({});

      await client.removeLabelFromCard('card1', 'label1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/cards/card1/idLabels/label1');
    });
  });

  describe('Due Date Operations', () => {
    it('should set card due date', async () => {
      const dueDate = '2025-12-31T23:59:59.999Z';
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Card with due date',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: dueDate,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.setCardDueDate('1', dueDate);

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { due: dueDate });
      expect(result.due).toBe(dueDate);
    });

    it('should remove card due date', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Card without due date',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.removeCardDueDate('1');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { due: null });
      expect(result.due).toBeNull();
    });

    it('should mark due date complete', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Card with completed due date',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: '2025-12-31T23:59:59.999Z',
        dueComplete: true,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.markDueDateComplete('1', true);

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { dueComplete: true });
      expect(result.dueComplete).toBe(true);
    });

    it('should get cards by due date sorted', async () => {
      const mockCards: TrelloCard[] = [
        {
          id: '2',
          name: 'Later Card',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/2',
          shortUrl: 'https://trello.com/c/2',
          closed: false,
          due: '2025-12-31T23:59:59.999Z',
          labels: []
        },
        {
          id: '1',
          name: 'Earlier Card',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/1',
          shortUrl: 'https://trello.com/c/1',
          closed: false,
          due: '2025-11-15T23:59:59.999Z',
          labels: []
        },
        {
          id: '3',
          name: 'No due date',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/3',
          shortUrl: 'https://trello.com/c/3',
          closed: false,
          due: null,
          labels: []
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCards });

      const result = await client.getCardsByDueDate('board1');

      // Should filter out cards without due dates and sort by date
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1'); // Earlier date first
      expect(result[1].id).toBe('2'); // Later date second
    });
  });

  describe('Comment Operations', () => {
    it('should add comment to card', async () => {
      const mockComment = {
        id: '1',
        type: 'commentCard',
        data: { text: 'Test comment' },
        date: '2025-11-15T12:00:00.000Z'
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockComment });

      const result = await client.addComment('card1', 'Test comment');

      expect(mockInstance.post).toHaveBeenCalledWith('/cards/card1/actions/comments', {
        text: 'Test comment'
      });
      expect(result).toEqual(mockComment);
    });

    it('should get comments on card', async () => {
      const mockComments = [
        {
          id: '1',
          type: 'commentCard',
          data: { text: 'Comment 1' },
          date: '2025-11-15T12:00:00.000Z'
        },
        {
          id: '2',
          type: 'commentCard',
          data: { text: 'Comment 2' },
          date: '2025-11-15T13:00:00.000Z'
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockComments });

      const result = await client.getComments('card1');

      expect(mockInstance.get).toHaveBeenCalledWith('/cards/card1/actions', {
        params: { filter: 'commentCard' }
      });
      expect(result).toEqual(mockComments);
    });
  });

  describe('Additional Card Operations', () => {
    it('should update card name', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'New Name',
        desc: '',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockCard });

      const result = await client.updateCardName('1', 'New Name');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should get card by ID', async () => {
      const mockCard: TrelloCard = {
        id: '1',
        name: 'Test Card',
        desc: 'Test description',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: null,
        labels: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCard });

      const result = await client.getCard('1');

      expect(mockInstance.get).toHaveBeenCalledWith('/cards/1');
      expect(result).toEqual(mockCard);
    });

    it('should get card details with full data', async () => {
      const mockCard = {
        id: '1',
        name: 'Detailed Card',
        desc: 'Full description',
        idList: 'list1',
        idBoard: 'board1',
        url: 'https://trello.com/c/1',
        shortUrl: 'https://trello.com/c/1',
        closed: false,
        due: '2025-12-31T23:59:59.999Z',
        dueComplete: false,
        labels: [
          { id: 'label1', name: 'Priority', color: 'red', idBoard: 'board1' }
        ],
        members: [
          { id: 'member1', fullName: 'John Doe', username: 'johndoe' }
        ],
        checklists: [
          {
            id: 'checklist1',
            name: 'Todo',
            pos: 16384,
            checkItems: [
              { id: 'item1', name: 'Task 1', state: 'complete', pos: 16384 }
            ]
          }
        ],
        attachments: [
          { id: 'att1', name: 'file.pdf', url: 'https://example.com/file.pdf' }
        ]
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCard });

      const result = await client.getCardDetails('1');

      expect(mockInstance.get).toHaveBeenCalledWith('/cards/1', {
        params: {
          fields: 'all',
          members: 'true',
          member_fields: 'fullName,username',
          checklists: 'all',
          attachments: 'true',
          customFieldItems: 'true'
        }
      });
      expect(result).toEqual(mockCard);
    });

    it('should get list by ID', async () => {
      const mockList = {
        id: 'list1',
        name: 'Test List',
        idBoard: 'board1',
        closed: false,
        pos: 16384
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockList });

      const result = await client.getList('list1');

      expect(mockInstance.get).toHaveBeenCalledWith('/lists/list1');
      expect(result).toEqual(mockList);
    });

    it('should get all cards from a board', async () => {
      const mockCards: TrelloCard[] = [
        {
          id: '1',
          name: 'Card 1',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/1',
          shortUrl: 'https://trello.com/c/1',
          closed: false,
          due: null,
          labels: []
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCards });

      const result = await client.getBoardCards('board1');

      expect(mockInstance.get).toHaveBeenCalledWith('/boards/board1/cards');
      expect(result).toEqual(mockCards);
    });
  });

  describe('Member Operations', () => {
    it('should get board members', async () => {
      const mockMembers = [
        { id: 'member1', fullName: 'John Doe', username: 'johndoe' },
        { id: 'member2', fullName: 'Jane Smith', username: 'janesmith' }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockMembers });

      const result = await client.getBoardMembers('board1');

      expect(mockInstance.get).toHaveBeenCalledWith('/boards/board1/members');
      expect(result).toEqual(mockMembers);
    });

    it('should add member to card', async () => {
      const mockMembers: TrelloMember[] = [
        {
          id: 'member1',
          fullName: 'John Doe',
          username: 'johndoe'
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockMembers });

      const result = await client.addMemberToCard('1', 'member1');

      expect(mockInstance.post).toHaveBeenCalledWith('/cards/1/idMembers', null, {
        params: { value: 'member1' }
      });
      expect(result).toEqual(mockMembers);
      expect(result[0].fullName).toBe('John Doe');
    });

    it('should remove member from card', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.delete.mockResolvedValue({});

      await client.removeMemberFromCard('1', 'member1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/cards/1/idMembers/member1');
    });

    it('should get member cards', async () => {
      const mockCards: TrelloCard[] = [
        {
          id: '1',
          name: 'Member Card',
          desc: '',
          idList: 'list1',
          idBoard: 'board1',
          url: 'https://trello.com/c/1',
          shortUrl: 'https://trello.com/c/1',
          closed: false,
          due: null,
          labels: []
        }
      ];

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCards });

      const result = await client.getMemberCards('member1', 'board1');

      expect(mockInstance.get).toHaveBeenCalledWith('/members/member1/cards', {
        params: {
          filter: 'open',
          fields: 'id,name,desc,idList,idBoard,url,shortUrl,due,dueComplete,labels,idMembers'
        }
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe('Checklist Operations', () => {
    it('should add checklist to card', async () => {
      const mockChecklist = {
        id: 'checklist1',
        name: 'Todo',
        pos: 16384,
        checkItems: []
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockChecklist });

      const result = await client.addChecklist('card1', 'Todo', 'top');

      expect(mockInstance.post).toHaveBeenCalledWith('/cards/card1/checklists', {
        name: 'Todo',
        pos: 'top'
      });
      expect(result).toEqual(mockChecklist);
    });

    it('should add checklist item', async () => {
      const mockItem = {
        id: 'item1',
        name: 'Task 1',
        state: 'incomplete',
        pos: 16384
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({ data: mockItem });

      const result = await client.addChecklistItem('checklist1', 'Task 1', 'bottom', false);

      expect(mockInstance.post).toHaveBeenCalledWith('/checklists/checklist1/checkItems', {
        name: 'Task 1',
        pos: 'bottom',
        checked: false
      });
      expect(result).toEqual(mockItem);
    });

    it('should update checklist item state', async () => {
      const mockItem = {
        id: 'item1',
        name: 'Task 1',
        state: 'complete',
        pos: 16384
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.put.mockResolvedValue({ data: mockItem });

      const result = await client.updateChecklistItem('card1', 'item1', 'complete');

      expect(mockInstance.put).toHaveBeenCalledWith('/cards/card1/checkItem/item1', {
        state: 'complete'
      });
      expect(result).toEqual(mockItem);
    });

    it('should get checklist progress', async () => {
      const mockCard = {
        checklists: [
          {
            id: 'checklist1',
            name: 'Todo',
            checkItems: [
              { id: 'item1', name: 'Task 1', state: 'complete' },
              { id: 'item2', name: 'Task 2', state: 'incomplete' }
            ]
          }
        ]
      };

      const mockInstance = (client as any).axiosInstance;
      mockInstance.get.mockResolvedValue({ data: mockCard });

      const result = await client.getChecklistProgress('card1');

      expect(mockInstance.get).toHaveBeenCalledWith('/cards/card1', {
        params: {
          fields: 'id,name',
          checklists: 'all'
        }
      });
      expect(result.checklists).toHaveLength(1);
      expect(result.checklists[0].checkItemsChecked).toBe(1);
      expect(result.checklists[0].checkItems).toBe(2);
      expect(result.overall.total).toBe(2);
      expect(result.overall.checked).toBe(1);
    });

    it('should delete checklist', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.delete.mockResolvedValue({});

      await client.deleteChecklist('checklist1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/checklists/checklist1');
    });
  });
});
