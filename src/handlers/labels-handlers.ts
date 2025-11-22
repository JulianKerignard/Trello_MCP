/**
 * Label Handlers
 * Handlers for label-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloLabel } from '../types.js';

/**
 * List all labels of a board
 */
export class ListLabelsHandler extends BaseToolHandler<{ boardId: string }, TrelloLabel[]> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const labels = await this.trelloClient.getLabels(args.boardId);

    if (labels.length === 0) {
      return this.formatResponse('Aucun label trouvé sur ce board.');
    }

    let output = `🏷️ Labels du Board (${labels.length})\n\n`;
    labels.forEach((label, index) => {
      output += `${index + 1}. ${label.name || '(sans nom)'} - ${label.color}\n`;
      output += `   ID: ${label.id}\n\n`;
    });

    return this.formatResponse(output);
  }
}

/**
 * Create a new label on a board
 */
export class CreateLabelHandler extends BaseToolHandler<
  { boardId: string; name: string; color: string },
  TrelloLabel
> {
  async execute(args: { boardId: string; name: string; color: string }): Promise<ToolResult> {
    this.validate(args);

    const label = await this.trelloClient.createLabel(args.boardId, args.name, args.color);

    const text =
      `🏷️ Label créé!\n\n` +
      `ID: ${label.id}\n` +
      `Nom: ${label.name}\n` +
      `Couleur: ${label.color}\n` +
      `Board ID: ${label.idBoard}`;

    return this.formatResponse(text);
  }
}

/**
 * Update an existing label
 */
export class UpdateLabelHandler extends BaseToolHandler<
  { labelId: string; name?: string; color?: string },
  TrelloLabel
> {
  async execute(args: { labelId: string; name?: string; color?: string }): Promise<ToolResult> {
    this.validate(args);

    const label = await this.trelloClient.updateLabel(args.labelId, {
      ...(args.name && { name: args.name }),
      ...(args.color && { color: args.color })
    });

    const text =
      `🏷️ Label mis à jour!\n\n` +
      `ID: ${label.id}\n` +
      `Nouveau nom: ${label.name}\n` +
      `Nouvelle couleur: ${label.color}`;

    return this.formatResponse(text);
  }
}

/**
 * Add a label to a card
 */
export class AddLabelToCardHandler extends BaseToolHandler<
  { cardId: string; labelId: string },
  void
> {
  async execute(args: { cardId: string; labelId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.addLabelToCard(args.cardId, args.labelId);

    const text =
      `Label ajouté à la carte avec succès! ✅\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Label ID: ${args.labelId}`;

    return this.formatResponse(text);
  }
}

/**
 * Remove a label from a card
 */
export class RemoveLabelFromCardHandler extends BaseToolHandler<
  { cardId: string; labelId: string },
  void
> {
  async execute(args: { cardId: string; labelId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.removeLabelFromCard(args.cardId, args.labelId);

    const text =
      `Label retiré de la carte avec succès! ✅\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Label ID: ${args.labelId}`;

    return this.formatResponse(text);
  }
}
