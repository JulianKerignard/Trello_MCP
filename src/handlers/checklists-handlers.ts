/**
 * Checklist Handlers
 * Handlers for checklist-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloChecklist, TrelloCheckItem, CardPosition } from '../types.js';

/**
 * Add a checklist to a card
 */
export class AddChecklistToCardHandler extends BaseToolHandler<
  { cardId: string; name: string; pos?: CardPosition },
  TrelloChecklist
> {
  async execute(args: { cardId: string; name: string; pos?: CardPosition }): Promise<ToolResult> {
    this.validate(args);

    const checklist = await this.trelloClient.addChecklist(args.cardId, args.name, args.pos);

    const text =
      `✅ Checklist créée!\n\n` +
      `ID: ${checklist.id}\n` +
      `Nom: ${checklist.name}\n` +
      `Position: ${checklist.pos}\n` +
      `Items: 0`;

    return this.formatResponse(text);
  }
}

/**
 * Add an item to a checklist
 */
export class AddChecklistItemHandler extends BaseToolHandler<
  { checklistId: string; name: string; pos?: CardPosition; checked?: boolean },
  TrelloCheckItem
> {
  async execute(args: {
    checklistId: string;
    name: string;
    pos?: CardPosition;
    checked?: boolean;
  }): Promise<ToolResult> {
    this.validate(args);

    const item = await this.trelloClient.addChecklistItem(
      args.checklistId,
      args.name,
      args.pos,
      args.checked
    );

    const text =
      `✅ Item ajouté à la checklist!\n\n` +
      `ID: ${item.id}\n` +
      `Nom: ${item.name}\n` +
      `État: ${item.state === 'complete' ? '✅ Complété' : '⬜ À faire'}\n` +
      `Position: ${item.pos}`;

    return this.formatResponse(text);
  }
}

/**
 * Check or uncheck a checklist item
 */
export class CheckChecklistItemHandler extends BaseToolHandler<
  { cardId: string; checkItemId: string; state: 'complete' | 'incomplete' },
  TrelloCheckItem
> {
  async execute(args: {
    cardId: string;
    checkItemId: string;
    state: 'complete' | 'incomplete';
  }): Promise<ToolResult> {
    this.validate(args);

    const item = await this.trelloClient.updateChecklistItem(
      args.cardId,
      args.checkItemId,
      args.state
    );

    const text =
      `${args.state === 'complete' ? '✅' : '⬜'} Item mis à jour!\n\n` +
      `ID: ${item.id}\n` +
      `Nom: ${item.name}\n` +
      `Nouvel état: ${args.state === 'complete' ? '✅ Complété' : '⬜ À faire'}`;

    return this.formatResponse(text);
  }
}

/**
 * Get checklist progress for a card
 */
export class GetChecklistProgressHandler extends BaseToolHandler<
  { cardId: string },
  {
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
  }
> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const progress = await this.trelloClient.getChecklistProgress(args.cardId);

    if (progress.checklists.length === 0) {
      return this.formatResponse('Aucune checklist trouvée sur cette carte.');
    }

    let output = `📋 Progression des Checklists\n\n`;
    output += `Progression globale: ${progress.overall.checked}/${progress.overall.total} (${progress.overall.percentage}%)\n\n`;

    progress.checklists.forEach((checklist, index) => {
      const progressBar =
        '█'.repeat(Math.floor(checklist.progress / 10)) +
        '░'.repeat(10 - Math.floor(checklist.progress / 10));
      output += `${index + 1}. ${checklist.name}\n`;
      output += `   ${progressBar} ${checklist.progress}%\n`;
      output += `   ${checklist.checkItemsChecked}/${checklist.checkItems} items ${checklist.complete ? '✅' : '⏳'}\n\n`;
    });

    return this.formatResponse(output);
  }
}

/**
 * Delete a checklist
 */
export class DeleteChecklistHandler extends BaseToolHandler<{ checklistId: string }, void> {
  async execute(args: { checklistId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.deleteChecklist(args.checklistId);

    const text =
      `🗑️ Checklist supprimée!\n\n` +
      `ID: ${args.checklistId}\n` +
      `⚠️ Cette action est irréversible.`;

    return this.formatResponse(text);
  }
}
