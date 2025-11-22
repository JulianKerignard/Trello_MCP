/**
 * Date Handlers
 * Handlers for due date-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloCard } from '../types.js';

/**
 * Set due date on a card
 */
export class SetCardDueDateHandler extends BaseToolHandler<
  { cardId: string; dueDate: string },
  TrelloCard
> {
  async execute(args: { cardId: string; dueDate: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.setCardDueDate(args.cardId, args.dueDate);

    const text =
      `📅 Date limite définie!\n\n` +
      `Carte: ${card.name}\n` +
      `Due: ${new Date(card.due!).toLocaleString('fr-FR')}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Remove due date from a card
 */
export class RemoveCardDueDateHandler extends BaseToolHandler<{ cardId: string }, TrelloCard> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.removeCardDueDate(args.cardId);

    const text = `📅 Date limite retirée!\n\n` + `Carte: ${card.name}\n` + `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Mark due date as complete or incomplete
 */
export class MarkDueDateCompleteHandler extends BaseToolHandler<
  { cardId: string; complete?: boolean },
  TrelloCard
> {
  async execute(args: { cardId: string; complete?: boolean }): Promise<ToolResult> {
    this.validate(args);

    const isComplete = args.complete !== undefined ? args.complete : true;
    const card = await this.trelloClient.markDueDateComplete(args.cardId, isComplete);

    const text =
      `📅 Statut de la date limite mis à jour!\n\n` +
      `Carte: ${card.name}\n` +
      `Complété: ${isComplete ? 'Oui ✅' : 'Non ⏳'}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * List cards by due date (sorted by urgency)
 */
export class ListCardsByDueDateHandler extends BaseToolHandler<{ boardId: string }, TrelloCard[]> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const cards = await this.trelloClient.getCardsByDueDate(args.boardId);

    if (cards.length === 0) {
      return this.formatResponse('Aucune carte avec date limite trouvée sur ce board.');
    }

    let output = `📅 Cartes avec date limite (${cards.length}) - Triées par échéance\n\n`;
    cards.forEach((card, index) => {
      const dueDate = new Date(card.due!);
      const isOverdue = dueDate < new Date() && !card.dueComplete;
      const status = card.dueComplete ? '✅' : isOverdue ? '🔴 EN RETARD' : '⏳';

      output += `${index + 1}. ${card.name}\n`;
      output += `   Due: ${dueDate.toLocaleString('fr-FR')} ${status}\n`;
      output += `   URL: ${card.shortUrl}\n\n`;
    });

    return this.formatResponse(output);
  }
}
