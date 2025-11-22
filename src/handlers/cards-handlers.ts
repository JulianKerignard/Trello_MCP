/**
 * Card Handlers
 * Handlers for card-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloCard, CardPosition } from '../types.js';

/**
 * List all cards in a list
 */
export class ListCardsHandler extends BaseToolHandler<{ listId: string }, TrelloCard[]> {
  async execute(args: { listId: string }): Promise<ToolResult> {
    this.validate(args);

    const cards = await this.trelloClient.getCards(args.listId);
    const cardData = cards.map((card) => ({
      id: card.id,
      name: card.name,
      description: card.desc,
      url: card.url,
      shortUrl: card.shortUrl,
      listId: card.idList,
      boardId: card.idBoard,
      closed: card.closed,
      dueDate: card.due
    }));

    return this.formatJSON(cardData);
  }
}

/**
 * Create a new card
 */
export class CreateCardHandler extends BaseToolHandler<
  { listId: string; name: string; desc?: string },
  TrelloCard
> {
  async execute(args: { listId: string; name: string; desc?: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.createCard(args.listId, args.name, args.desc);

    const text =
      `Carte créée avec succès!\n\n` +
      `ID: ${card.id}\n` +
      `Nom: ${card.name}\n` +
      `List ID: ${card.idList}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Add a comment to a card
 */
export class AddCardCommentHandler extends BaseToolHandler<{ cardId: string; text: string }, void> {
  async execute(args: { cardId: string; text: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.addComment(args.cardId, args.text);

    const text =
      `Commentaire ajouté avec succès! ✅\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Texte: ${args.text.substring(0, 100)}${args.text.length > 100 ? '...' : ''}`;

    return this.formatResponse(text);
  }
}

/**
 * Move a card to another list
 */
export class MoveCardHandler extends BaseToolHandler<
  { cardId: string; targetListId: string; position?: CardPosition },
  TrelloCard
> {
  async execute(args: {
    cardId: string;
    targetListId: string;
    position?: CardPosition;
  }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.moveCard(args.cardId, args.targetListId, args.position);

    const text =
      `Carte déplacée avec succès!\n\n` +
      `ID: ${card.id}\n` +
      `Nom: ${card.name}\n` +
      `Nouvelle List ID: ${card.idList}\n` +
      `Position: ${args.position || 'top'}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Search cards
 */
export class SearchCardsHandler extends BaseToolHandler<
  {
    query: string;
    boardIds?: string[];
    limit?: number;
    partial?: boolean;
  },
  TrelloCard[]
> {
  async execute(args: {
    query: string;
    boardIds?: string[];
    limit?: number;
    partial?: boolean;
  }): Promise<ToolResult> {
    this.validate(args);

    const cards = await this.trelloClient.searchCards(args.query, {
      boardIds: args.boardIds,
      cardLimit: args.limit,
      partial: args.partial
    });

    if (cards.length === 0) {
      return this.formatResponse(`Aucune carte trouvée pour la recherche: "${args.query}"`);
    }

    let output = `${cards.length} carte(s) trouvée(s):\n\n`;
    output += JSON.stringify(
      cards.map((card) => ({
        id: card.id,
        name: card.name,
        description: card.desc,
        url: card.url,
        shortUrl: card.shortUrl,
        listId: card.idList,
        boardId: card.idBoard,
        closed: card.closed
      })),
      null,
      2
    );

    return this.formatResponse(output);
  }
}

/**
 * Update card description
 */
export class UpdateCardDescriptionHandler extends BaseToolHandler<
  { cardId: string; description: string },
  TrelloCard
> {
  async execute(args: { cardId: string; description: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.updateCard(args.cardId, { desc: args.description });

    const text =
      `Description mise à jour avec succès!\n\n` +
      `ID: ${card.id}\n` +
      `Nom: ${card.name}\n` +
      `Description: ${card.desc.substring(0, 100)}${card.desc.length > 100 ? '...' : ''}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Archive a card
 */
export class ArchiveCardHandler extends BaseToolHandler<{ cardId: string }, TrelloCard> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.archiveCard(args.cardId);

    const text =
      `Carte archivée avec succès! 📦\n\n` +
      `ID: ${card.id}\n` +
      `Nom: ${card.name}\n` +
      `URL: ${card.url}\n\n` +
      `Note: La carte peut être désarchivée avec unarchive_card.`;

    return this.formatResponse(text);
  }
}

/**
 * Delete a card permanently
 */
export class DeleteCardHandler extends BaseToolHandler<{ cardId: string }, void> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.deleteCard(args.cardId);

    const text =
      `⚠️ Carte supprimée définitivement!\n\n` +
      `ID: ${args.cardId}\n\n` +
      `Cette action est IRRÉVERSIBLE. La carte ne peut pas être récupérée.`;

    return this.formatResponse(text);
  }
}

/**
 * Unarchive a card
 */
export class UnarchiveCardHandler extends BaseToolHandler<{ cardId: string }, TrelloCard> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.unarchiveCard(args.cardId);

    const text =
      `Carte désarchivée avec succès! 📤\n\n` +
      `ID: ${card.id}\n` +
      `Nom: ${card.name}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Update card name
 */
export class UpdateCardNameHandler extends BaseToolHandler<
  { cardId: string; name: string },
  TrelloCard
> {
  async execute(args: { cardId: string; name: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.updateCardName(args.cardId, args.name);

    const text =
      `Nom de la carte mis à jour! ✏️\n\n` +
      `ID: ${card.id}\n` +
      `Nouveau nom: ${card.name}\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Get detailed card information
 */
export class GetCardDetailsHandler extends BaseToolHandler<{ cardId: string }, TrelloCard> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.getCardDetails(args.cardId);

    let output = `🔍 Détails de la carte\n\n`;
    output += `Nom: ${card.name}\n`;
    output += `ID: ${card.id}\n`;
    output += `Description: ${card.desc || '(aucune)'}\n`;
    output += `URL: ${card.url}\n`;
    output += `Statut: ${card.closed ? 'Archivée 📦' : 'Active ✅'}\n`;

    if (card.due) {
      const dueDate = new Date(card.due);
      const isOverdue = dueDate < new Date() && !card.dueComplete;
      const status = card.dueComplete ? '✅ Complété' : isOverdue ? '🔴 EN RETARD' : '⏳ En cours';
      output += `Due: ${dueDate.toLocaleString('fr-FR')} ${status}\n`;
    }

    if (card.labels && card.labels.length > 0) {
      output += `\nLabels (${card.labels.length}):\n`;
      card.labels.forEach((label) => {
        output += `  - ${label.name || '(sans nom)'} (${label.color})\n`;
      });
    }

    if (card.members && card.members.length > 0) {
      output += `\nMembres assignés (${card.members.length}):\n`;
      card.members.forEach((member) => {
        output += `  - ${member.fullName} (@${member.username})\n`;
      });
    }

    if (card.checklists && card.checklists.length > 0) {
      output += `\nChecklists (${card.checklists.length}):\n`;
      card.checklists.forEach((checklist) => {
        const total = checklist.checkItems.length;
        const checked = checklist.checkItems.filter((item) => item.state === 'complete').length;
        output += `  - ${checklist.name}: ${checked}/${total} items ✓\n`;
      });
    }

    if (card.attachments && card.attachments.length > 0) {
      output += `\nPièces jointes (${card.attachments.length}):\n`;
      card.attachments.forEach((attachment) => {
        output += `  - ${attachment.name} (${attachment.url})\n`;
      });
    }

    return this.formatResponse(output);
  }
}
