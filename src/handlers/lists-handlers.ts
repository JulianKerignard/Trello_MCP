/**
 * List Handlers
 * Handlers for list-related Trello operations (lists = colonnes)
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloList } from '../types.js';

/**
 * List all lists (columns) of a board
 */
export class ListListsHandler extends BaseToolHandler<{ boardId: string }, TrelloList[]> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const lists = await this.trelloClient.getLists(args.boardId);
    const listData = lists.map((list) => ({
      id: list.id,
      name: list.name,
      boardId: list.idBoard,
      position: list.pos,
      closed: list.closed
    }));

    return this.formatJSON(listData);
  }
}

/**
 * Create a new list on a board
 */
export class CreateListHandler extends BaseToolHandler<
  { boardId: string; name: string },
  TrelloList
> {
  async execute(args: { boardId: string; name: string }): Promise<ToolResult> {
    this.validate(args);

    const list = await this.trelloClient.createList(args.boardId, args.name);

    const text =
      `List créée avec succès!\n\n` +
      `ID: ${list.id}\n` +
      `Nom: ${list.name}\n` +
      `Board ID: ${list.idBoard}\n` +
      `Position: ${list.pos}`;

    return this.formatResponse(text);
  }
}
