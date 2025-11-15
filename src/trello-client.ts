/**
 * Trello API Client
 * Wrapper for Trello REST API with authentication and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloComment,
  TrelloAPIError,
  TrelloSearchResult,
  CardPosition
} from './types.js';

export class TrelloClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private apiToken: string;

  constructor(apiKey: string, apiToken: string) {
    if (!apiKey || !apiToken) {
      throw new Error(
        'Trello API credentials manquants.\n' +
        'TRELLO_API_KEY et TRELLO_API_TOKEN doivent être définis.\n' +
        'Obtenez-les sur https://trello.com/power-ups/admin'
      );
    }

    this.apiKey = apiKey;
    this.apiToken = apiToken;

    this.axiosInstance = axios.create({
      baseURL: 'https://api.trello.com/1',
      timeout: 30000, // 30 seconds
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

          if (status === 401) {
            throw new Error(
              'Authentification Trello échouée. Vérifiez:\n' +
              '1. TRELLO_API_KEY est valide (https://trello.com/power-ups/admin)\n' +
              '2. TRELLO_API_TOKEN n\'est pas expiré\n' +
              '3. Le token a les permissions requises (read, write)\n' +
              `Erreur API: ${message}`
            );
          } else if (status === 404) {
            throw new Error(`Ressource Trello non trouvée: ${message}`);
          } else if (status === 429) {
            throw new Error('Rate limit Trello atteint. Réessayez dans quelques secondes.');
          } else {
            throw new Error(`Erreur API Trello (${status}): ${message}`);
          }
        } else if (error.request) {
          throw new Error('Impossible de contacter l\'API Trello. Vérifiez votre connexion internet.');
        } else {
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
  async createCard(
    listId: string,
    name: string,
    desc?: string
  ): Promise<TrelloCard> {
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
    const response = await this.axiosInstance.put<TrelloCard>(
      `/cards/${cardId}`,
      { closed: true }
    );
    return response.data;
  }

  /**
   * Unarchive a card (set closed to false)
   */
  async unarchiveCard(cardId: string): Promise<TrelloCard> {
    const response = await this.axiosInstance.put<TrelloCard>(
      `/cards/${cardId}`,
      { closed: false }
    );
    return response.data;
  }

  /**
   * Permanently delete a card
   * WARNING: This action is irreversible!
   * Best practice: Archive cards first, delete later if really needed
   */
  async deleteCard(cardId: string): Promise<void> {
    await this.axiosInstance.delete(`/cards/${cardId}`);
    // DELETE returns 200 with empty body or 204 No Content
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
    const response = await this.axiosInstance.get<TrelloComment[]>(
      `/cards/${cardId}/actions`,
      {
        params: {
          filter: 'commentCard'
        }
      }
    );
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
    const response = await this.axiosInstance.put<TrelloCard>(
      `/cards/${cardId}`,
      {
        idList: targetListId,
        pos: position
      }
    );
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
      cards_limit: options.cardLimit || 25,
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
}
