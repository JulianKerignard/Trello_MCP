/**
 * Trello API Client
 * Wrapper for Trello REST API with authentication and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { createChildLogger, logError } from './logger.js';
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  TrelloMember,
  TrelloComment,
  TrelloAPIError,
  TrelloSearchResult,
  CardPosition,
  TrelloChecklist,
  TrelloCheckItem
} from './types.js';

const logger = createChildLogger({ module: 'TrelloClient' });

/**
 * Configuration constants for Trello API client
 */
const TRELLO_API_CONFIG = {
  BASE_URL: 'https://api.trello.com/1',
  TIMEOUT_MS: 30000, // 30 seconds
  DEFAULT_SEARCH_LIMIT: 25,
  MAX_SEARCH_LIMIT: 1000
} as const;

/**
 * HTTP status codes for error handling
 */
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMIT: 429
} as const;

export class TrelloClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private apiToken: string;

  constructor(apiKey: string, apiToken: string) {
    if (!apiKey || !apiToken) {
      logger.error('Missing Trello API credentials');
      throw new Error(
        'Trello API credentials manquants.\n' +
          'TRELLO_API_KEY et TRELLO_API_TOKEN doivent être définis.\n' +
          'Obtenez-les sur https://trello.com/power-ups/admin'
      );
    }

    this.apiKey = apiKey;
    this.apiToken = apiToken;

    logger.info(
      {
        baseURL: TRELLO_API_CONFIG.BASE_URL,
        timeout: TRELLO_API_CONFIG.TIMEOUT_MS
      },
      'Trello client initialized'
    );

    this.axiosInstance = axios.create({
      baseURL: TRELLO_API_CONFIG.BASE_URL,
      timeout: TRELLO_API_CONFIG.TIMEOUT_MS,
      params: {
        key: this.apiKey,
        token: this.apiToken
      }
    });

    // Intercepteur pour une meilleure gestion d'erreurs
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<TrelloAPIError>) => {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.message;

          logger.error(
            {
              status,
              message,
              url: error.config?.url,
              method: error.config?.method
            },
            'Trello API error'
          );

          if (status === HTTP_STATUS.UNAUTHORIZED) {
            throw new Error(
              'Authentification Trello échouée. Vérifiez:\n' +
                '1. TRELLO_API_KEY est valide (https://trello.com/power-ups/admin)\n' +
                "2. TRELLO_API_TOKEN n'est pas expiré\n" +
                '3. Le token a les permissions requises (read, write)\n' +
                `Erreur API: ${message}`
            );
          } else if (status === HTTP_STATUS.NOT_FOUND) {
            throw new Error(`Ressource Trello non trouvée: ${message}`);
          } else if (status === HTTP_STATUS.RATE_LIMIT) {
            logger.warn('Trello rate limit reached');
            throw new Error('Rate limit Trello atteint. Réessayez dans quelques secondes.');
          } else {
            throw new Error(`Erreur API Trello (${status}): ${message}`);
          }
        } else if (error.request) {
          logger.error({ error: error.message }, 'Cannot contact Trello API');
          throw new Error(
            "Impossible de contacter l'API Trello. Vérifiez votre connexion internet."
          );
        } else {
          logError(error as Error, 'Trello request error');
          throw new Error(`Erreur requête Trello: ${error.message}`);
        }
      }
    );
  }

  /**
   * Get all boards accessible to the authenticated user
   */
  async getBoards(): Promise<TrelloBoard[]> {
    const response = await this.axiosInstance.get<TrelloBoard[]>('/members/me/boards');
    return response.data;
  }

  /**
   * Create a new board
   */
  async createBoard(name: string, desc?: string): Promise<TrelloBoard> {
    const response = await this.axiosInstance.post<TrelloBoard>('/boards', {
      name,
      desc: desc || '',
      defaultLists: false // Don't create default lists
    });
    return response.data;
  }

  /**
   * Get a specific board by ID
   */
  async getBoard(boardId: string): Promise<TrelloBoard> {
    const response = await this.axiosInstance.get<TrelloBoard>(`/boards/${boardId}`);
    return response.data;
  }

  /**
   * Close/Archive a board (reversible)
   */
  async closeBoard(boardId: string): Promise<TrelloBoard> {
    const response = await this.axiosInstance.put<TrelloBoard>(`/boards/${boardId}`, {
      closed: true
    });
    logger.info({ boardId }, 'Board closed');
    return response.data;
  }

  /**
   * Reopen/Unarchive a board
   */
  async reopenBoard(boardId: string): Promise<TrelloBoard> {
    const response = await this.axiosInstance.put<TrelloBoard>(`/boards/${boardId}`, {
      closed: false
    });
    logger.info({ boardId }, 'Board reopened');
    return response.data;
  }

  /**
   * Permanently delete a board
   *
   * @param boardId - The ID of the board to delete
   * @returns Promise<void> - API returns 200 with empty body
   *
   * @warning This action is IRREVERSIBLE! Deleted boards cannot be recovered.
   * @best-practice Close boards first with closeBoard(), delete only if absolutely necessary
   *
   * @example
   * ```typescript
   * // Recommended: Close first
   * await trelloClient.closeBoard('boardId123');
   *
   * // Only if really needed:
   * await trelloClient.deleteBoard('boardId123');
   * ```
   */
  async deleteBoard(boardId: string): Promise<void> {
    await this.axiosInstance.delete(`/boards/${boardId}`);
    logger.warn({ boardId }, 'Board permanently deleted');
  }

  /**
   * Get all lists on a board
   */
  async getLists(boardId: string): Promise<TrelloList[]> {
    const response = await this.axiosInstance.get<TrelloList[]>(`/boards/${boardId}/lists`);
    return response.data;
  }

  /**
   * Create a new list on a board
   */
  async createList(boardId: string, name: string): Promise<TrelloList> {
    const response = await this.axiosInstance.post<TrelloList>('/lists', {
      name,
      idBoard: boardId
    });
    return response.data;
  }

  /**
   * Get a specific list by ID
   */
  async getList(listId: string): Promise<TrelloList> {
    const response = await this.axiosInstance.get<TrelloList>(`/lists/${listId}`);
    return response.data;
  }

  /**
   * Get all cards in a list
   */
  async getCards(listId: string): Promise<TrelloCard[]> {
    const response = await this.axiosInstance.get<TrelloCard[]>(`/lists/${listId}/cards`);
    return response.data;
  }

  /**
   * Get all cards on a board
   */
  async getBoardCards(boardId: string): Promise<TrelloCard[]> {
    const response = await this.axiosInstance.get<TrelloCard[]>(`/boards/${boardId}/cards`);
    return response.data;
  }

  /**
   * Create a new card
   */
  async createCard(listId: string, name: string, desc?: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.post<TrelloCard>('/cards', {
      idList: listId,
      name,
      desc: desc || ''
    });
    return response.data;
  }

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.get<TrelloCard>(`/cards/${cardId}`);
    return response.data;
  }

  /**
   * Update a card
   */
  async updateCard(
    cardId: string,
    updates: { name?: string; desc?: string; idList?: string }
  ): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, updates);
    return response.data;
  }

  /**
   * Archive a card (set closed to true)
   * This is reversible - archived cards can be unarchived later
   */
  async archiveCard(cardId: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, { closed: true });
    return response.data;
  }

  /**
   * Unarchive a card (set closed to false)
   */
  async unarchiveCard(cardId: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, {
      closed: false
    });
    return response.data;
  }

  /**
   * Permanently delete a card
   *
   * @param cardId - The ID of the card to delete
   * @returns Promise<void> - API returns 200 with empty body or 204 No Content
   *
   * @warning This action is irreversible! Deleted cards cannot be recovered.
   * @best-practice Archive cards first with archiveCard(), delete only if absolutely necessary
   *
   * @example
   * ```typescript
   * // Recommended: Archive first
   * await trelloClient.archiveCard('cardId123');
   *
   * // Only if really needed:
   * await trelloClient.deleteCard('cardId123');
   * ```
   */
  async deleteCard(cardId: string): Promise<void> {
    await this.axiosInstance.delete(`/cards/${cardId}`);
  }

  /**
   * Add a comment to a card
   */
  async addComment(cardId: string, text: string): Promise<TrelloComment> {
    const response = await this.axiosInstance.post<TrelloComment>(
      `/cards/${cardId}/actions/comments`,
      { text }
    );
    return response.data;
  }

  /**
   * Get comments on a card
   */
  async getComments(cardId: string): Promise<TrelloComment[]> {
    const response = await this.axiosInstance.get<TrelloComment[]>(`/cards/${cardId}/actions`, {
      params: {
        filter: 'commentCard'
      }
    });
    return response.data;
  }

  /**
   * Move a card to a different list and/or change its position
   */
  async moveCard(
    cardId: string,
    targetListId: string,
    position: CardPosition = 'top'
  ): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, {
      idList: targetListId,
      pos: position
    });
    return response.data;
  }

  /**
   * Search for cards across boards
   */
  async searchCards(
    query: string,
    options: {
      boardIds?: string[];
      cardLimit?: number;
      partial?: boolean;
    } = {}
  ): Promise<TrelloCard[]> {
    const params: any = {
      query,
      modelTypes: 'cards',
      cards_limit: options.cardLimit || TRELLO_API_CONFIG.DEFAULT_SEARCH_LIMIT,
      card_fields: 'id,name,desc,idList,idBoard,url,shortUrl,closed,due,labels'
    };

    if (options.boardIds && options.boardIds.length > 0) {
      params.idBoards = options.boardIds.join(',');
    }

    if (options.partial !== undefined) {
      params.partial = options.partial;
    }

    const response = await this.axiosInstance.get<TrelloSearchResult>('/search', {
      params
    });

    return response.data.cards || [];
  }

  /**
   * Update card name/title
   */
  async updateCardName(cardId: string, name: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, { name });
    return response.data;
  }

  /**
   * Get full card details with all nested objects
   * @param cardId - Card ID
   * @param fields - Fields to include (default: 'all')
   */
  async getCardDetails(cardId: string, fields: string = 'all'): Promise<TrelloCard> {
    const response = await this.axiosInstance.get<TrelloCard>(`/cards/${cardId}`, {
      params: {
        fields,
        members: 'true',
        member_fields: 'fullName,username',
        checklists: 'all',
        attachments: 'true',
        customFieldItems: 'true'
      }
    });
    return response.data;
  }

  // ========== Label Methods ==========

  /**
   * Get all labels on a board
   */
  async getLabels(boardId: string): Promise<TrelloLabel[]> {
    const response = await this.axiosInstance.get<TrelloLabel[]>(`/boards/${boardId}/labels`);
    return response.data;
  }

  /**
   * Create a new label on a board
   */
  async createLabel(boardId: string, name: string, color: string): Promise<TrelloLabel> {
    const response = await this.axiosInstance.post<TrelloLabel>(`/boards/${boardId}/labels`, {
      name,
      color
    });
    return response.data;
  }

  /**
   * Update a label
   */
  async updateLabel(
    labelId: string,
    updates: { name?: string; color?: string }
  ): Promise<TrelloLabel> {
    const response = await this.axiosInstance.put<TrelloLabel>(`/labels/${labelId}`, updates);
    return response.data;
  }

  /**
   * Add a label to a card
   * IMPORTANT: Use POST to ADD, not PUT (PUT replaces all labels)
   */
  async addLabelToCard(cardId: string, labelId: string): Promise<void> {
    await this.axiosInstance.post(`/cards/${cardId}/idLabels`, { value: labelId });
  }

  /**
   * Remove a label from a card
   */
  async removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
    await this.axiosInstance.delete(`/cards/${cardId}/idLabels/${labelId}`);
  }

  // ========== Due Date Methods ==========

  /**
   * Set due date on a card
   * @param cardId - Card ID
   * @param dueDate - ISO 8601 date string (e.g., "2025-12-31T23:59:59.999Z")
   */
  async setCardDueDate(cardId: string, dueDate: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, { due: dueDate });
    return response.data;
  }

  /**
   * Remove due date from a card
   */
  async removeCardDueDate(cardId: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, { due: null });
    return response.data;
  }

  /**
   * Mark due date as complete (or incomplete)
   */
  async markDueDateComplete(cardId: string, complete: boolean = true): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(`/cards/${cardId}`, {
      dueComplete: complete
    });
    return response.data;
  }

  /**
   * Get all cards on a board, sorted by due date
   */
  async getCardsByDueDate(boardId: string): Promise<TrelloCard[]> {
    const cards = await this.getBoardCards(boardId);
    // Filter cards with due dates and sort
    return cards
      .filter((card) => card.due !== null && card.due !== undefined)
      .sort((a, b) => {
        const dateA = new Date(a.due!).getTime();
        const dateB = new Date(b.due!).getTime();
        return dateA - dateB; // Ascending order (earliest first)
      });
  }

  /**
   * Checklist Operations
   */

  /**
   * Add a checklist to a card
   */
  async addChecklist(cardId: string, name: string, pos?: CardPosition): Promise<TrelloChecklist> {
    const response = await this.axiosInstance.post(`/cards/${cardId}/checklists`, {
      name,
      pos: pos || 'bottom'
    });
    logger.info({ cardId, checklistName: name }, 'Checklist added to card');
    return response.data;
  }

  /**
   * Add an item to a checklist
   */
  async addChecklistItem(
    checklistId: string,
    name: string,
    pos?: CardPosition,
    checked?: boolean
  ): Promise<TrelloCheckItem> {
    const response = await this.axiosInstance.post(`/checklists/${checklistId}/checkItems`, {
      name,
      pos: pos || 'bottom',
      checked: checked || false
    });
    logger.info({ checklistId, itemName: name }, 'Item added to checklist');
    return response.data;
  }

  /**
   * Update the state of a checklist item (check/uncheck)
   */
  async updateChecklistItem(
    cardId: string,
    checkItemId: string,
    state: 'complete' | 'incomplete'
  ): Promise<TrelloCheckItem> {
    const response = await this.axiosInstance.put(`/cards/${cardId}/checkItem/${checkItemId}`, {
      state
    });
    logger.info({ cardId, checkItemId, state }, 'Checklist item updated');
    return response.data;
  }

  /**
   * Delete a checklist
   */
  async deleteChecklist(checklistId: string): Promise<void> {
    await this.axiosInstance.delete(`/checklists/${checklistId}`);
    logger.info({ checklistId }, 'Checklist deleted');
  }

  /**
   * Get checklist progress for a card
   */
  async getChecklistProgress(cardId: string): Promise<{
    checklists: Array<{
      id: string;
      name: string;
      checkItems: number;
      checkItemsChecked: number;
      progress: number;
      complete: boolean;
    }>;
    overall: {
      total: number;
      checked: number;
      percentage: number;
    };
  }> {
    const card = await this.getCardDetails(cardId);

    const checklistsProgress =
      card.checklists?.map((checklist) => {
        const total = checklist.checkItems.length;
        const checked = checklist.checkItems.filter((item) => item.state === 'complete').length;
        const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

        return {
          id: checklist.id,
          name: checklist.name,
          checkItems: total,
          checkItemsChecked: checked,
          progress,
          complete: checked === total && total > 0
        };
      }) || [];

    const overallTotal = checklistsProgress.reduce((sum, cl) => sum + cl.checkItems, 0);
    const overallChecked = checklistsProgress.reduce((sum, cl) => sum + cl.checkItemsChecked, 0);
    const overallPercentage =
      overallTotal > 0 ? Math.round((overallChecked / overallTotal) * 100) : 0;

    return {
      checklists: checklistsProgress,
      overall: {
        total: overallTotal,
        checked: overallChecked,
        percentage: overallPercentage
      }
    };
  }

  // ========== v1.10 - Members Management ==========

  /**
   * Get all members of a board
   */
  async getBoardMembers(boardId: string): Promise<TrelloMember[]> {
    const response = await this.axiosInstance.get(`/boards/${boardId}/members`);
    logger.info({ boardId, memberCount: response.data.length }, 'Board members retrieved');
    return response.data;
  }

  /**
   * Add a member to a card (assign)
   * @returns Array of members (Trello API returns the added member details)
   */
  async addMemberToCard(cardId: string, memberId: string): Promise<TrelloMember[]> {
    const response = await this.axiosInstance.post<TrelloMember[]>(
      `/cards/${cardId}/idMembers`,
      null,
      {
        params: { value: memberId }
      }
    );
    logger.info({ cardId, memberId }, 'Member added to card');
    return response.data;
  }

  /**
   * Remove a member from a card (unassign)
   */
  async removeMemberFromCard(cardId: string, memberId: string): Promise<void> {
    await this.axiosInstance.delete(`/cards/${cardId}/idMembers/${memberId}`);
    logger.info({ cardId, memberId }, 'Member removed from card');
  }

  /**
   * Get all cards assigned to a member on a specific board
   */
  async getMemberCards(
    memberId: string,
    boardId?: string
  ): Promise<
    Array<
      TrelloCard & {
        idBoard: string;
        boardName?: string;
      }
    >
  > {
    const response = await this.axiosInstance.get(`/members/${memberId}/cards`, {
      params: {
        filter: 'open',
        fields: 'id,name,desc,idList,idBoard,url,shortUrl,due,dueComplete,labels,idMembers'
      }
    });

    let cards = response.data;

    // Filter by board if specified
    if (boardId) {
      cards = cards.filter((card: any) => card.idBoard === boardId);
    }

    logger.info({ memberId, boardId, cardCount: cards.length }, 'Member cards retrieved');

    return cards;
  }
}
