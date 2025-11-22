/**
 * Board Handlers
 * Handlers for board-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloBoard } from '../types.js';

/**
 * List all Trello boards
 */
export class ListBoardsHandler extends BaseToolHandler<Record<string, never>, TrelloBoard[]> {
  async execute(_args: Record<string, never>): Promise<ToolResult> {
    const boards = await this.trelloClient.getBoards();
    const boardList = boards.map((board) => ({
      id: board.id,
      name: board.name,
      url: board.url,
      description: board.desc,
      closed: board.closed
    }));

    return this.formatJSON(boardList);
  }
}

/**
 * Create a new Trello board
 */
export class CreateBoardHandler extends BaseToolHandler<
  { name: string; desc?: string },
  TrelloBoard
> {
  async execute(args: { name: string; desc?: string }): Promise<ToolResult> {
    this.validate(args);

    const board = await this.trelloClient.createBoard(args.name, args.desc);

    const text =
      `Board créé avec succès!\n\n` +
      `ID: ${board.id}\n` +
      `Nom: ${board.name}\n` +
      `URL: ${board.url}\n` +
      `Description: ${board.desc || '(aucune)'}`;

    return this.formatResponse(text);
  }
}

/**
 * Close (archive) a Trello board
 */
export class CloseBoardHandler extends BaseToolHandler<{ boardId: string }, TrelloBoard> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const board = await this.trelloClient.closeBoard(args.boardId);

    const text =
      `Board archivé avec succès!\n\n` +
      `ID: ${board.id}\n` +
      `Nom: ${board.name}\n` +
      `Statut: ${board.closed ? 'Fermé (archivé)' : 'Ouvert'}\n\n` +
      `Note: Ce board peut être réouvert avec reopen_board`;

    return this.formatResponse(text);
  }
}

/**
 * Reopen (unarchive) a Trello board
 */
export class ReopenBoardHandler extends BaseToolHandler<{ boardId: string }, TrelloBoard> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const board = await this.trelloClient.reopenBoard(args.boardId);

    const text =
      `Board réouvert avec succès!\n\n` +
      `ID: ${board.id}\n` +
      `Nom: ${board.name}\n` +
      `Statut: ${board.closed ? 'Fermé' : 'Ouvert (actif)'}\n` +
      `URL: ${board.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Permanently delete a Trello board
 */
export class DeleteBoardHandler extends BaseToolHandler<{ boardId: string }, void> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.deleteBoard(args.boardId);

    const text =
      `⚠️ Board DÉFINITIVEMENT supprimé!\n\n` +
      `ID: ${args.boardId}\n\n` +
      `⚠️ ATTENTION: Cette action est IRRÉVERSIBLE.\n` +
      `Le board ne peut PAS être récupéré.\n\n` +
      `Recommandation: Utilisez close_board pour archiver au lieu de supprimer définitivement.`;

    return this.formatResponse(text);
  }
}
