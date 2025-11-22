/**
 * Unit tests for TypeScript types and interfaces
 */

import { describe, it, expect } from 'vitest';
import type { TrelloBoard, TrelloList, TrelloCard, TrelloLabel, CardPosition } from './types.js';

describe('TypeScript Types', () => {
  describe('TrelloBoard', () => {
    it('should accept valid board object', () => {
      const board: TrelloBoard = {
        id: '123',
        name: 'Test Board',
        desc: 'Board description',
        url: 'https://trello.com/b/123',
        closed: false
      };

      expect(board.id).toBe('123');
      expect(board.name).toBe('Test Board');
    });
  });

  describe('TrelloList', () => {
    it('should accept valid list object', () => {
      const list: TrelloList = {
        id: '456',
        name: 'To Do',
        idBoard: '123',
        closed: false,
        pos: 1
      };

      expect(list.id).toBe('456');
      expect(list.name).toBe('To Do');
      expect(list.closed).toBe(false);
    });
  });

  describe('TrelloCard', () => {
    it('should accept valid card object with all required fields', () => {
      const card: TrelloCard = {
        id: '789',
        name: 'Test Card',
        desc: 'Description',
        idList: '456',
        idBoard: '123',
        url: 'https://trello.com/c/789',
        shortUrl: 'https://trello.com/c/789',
        closed: false,
        due: null,
        labels: []
      };

      expect(card.id).toBe('789');
      expect(card.name).toBe('Test Card');
      expect(card.closed).toBe(false);
    });

    it('should accept card with due date', () => {
      const dueDate = '2025-12-31T23:59:59.999Z';
      const card: TrelloCard = {
        id: '789',
        name: 'Card with due date',
        desc: '',
        idList: '456',
        idBoard: '123',
        url: 'https://trello.com/c/789',
        shortUrl: 'https://trello.com/c/789',
        closed: false,
        due: dueDate,
        dueComplete: true,
        labels: []
      };

      expect(card.due).toBe(dueDate);
      expect(card.dueComplete).toBe(true);
    });

    it('should accept card with labels', () => {
      const card: TrelloCard = {
        id: '789',
        name: 'Card with labels',
        desc: '',
        idList: '456',
        idBoard: '123',
        url: 'https://trello.com/c/789',
        shortUrl: 'https://trello.com/c/789',
        closed: false,
        due: null,
        labels: [
          { id: 'l1', name: 'Priority', color: 'red', idBoard: '123' },
          { id: 'l2', name: 'Bug', color: 'orange', idBoard: '123' }
        ]
      };

      expect(card.labels).toBeDefined();
      expect(card.labels).toHaveLength(2);
      expect(card.labels![0].name).toBe('Priority');
    });
  });

  describe('TrelloLabel', () => {
    it('should accept valid label object', () => {
      const label: TrelloLabel = {
        id: 'l1',
        name: 'P1 - Critique',
        color: 'red',
        idBoard: '123'
      };

      expect(label.id).toBe('l1');
      expect(label.name).toBe('P1 - Critique');
      expect(label.color).toBe('red');
    });
  });

  describe('CardPosition', () => {
    it('should accept "top" position', () => {
      const position: CardPosition = 'top';
      expect(position).toBe('top');
    });

    it('should accept "bottom" position', () => {
      const position: CardPosition = 'bottom';
      expect(position).toBe('bottom');
    });

    it('should accept numeric position', () => {
      const position: CardPosition = 12345;
      expect(position).toBe(12345);
    });
  });
});
