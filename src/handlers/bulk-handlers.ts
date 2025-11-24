/**
 * Bulk Operation Handlers
 * Handlers for performing bulk operations on multiple cards
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import { createChildLogger } from '../logger.js';

const logger = createChildLogger({ module: 'BulkHandlers' });

/**
 * Bulk operation result
 */
interface BulkResult {
  success: number;
  failed: number;
  errors: Array<{ cardId: string; error: string }>;
}

/**
 * Handler: Bulk archive cards
 */
export class BulkArchiveCardsHandler extends BaseToolHandler<{ cardIds: string[] }, BulkResult> {
  async execute(args: { cardIds: string[] }): Promise<ToolResult> {
    this.validate(args);

    const results: BulkResult = { success: 0, failed: 0, errors: [] };

    // Create operations
    const operations = args.cardIds.map(
      (cardId) => async () => {
        try {
          await this.trelloClient.archiveCard(cardId);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            cardId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    );

    // Execute with rate limiting
    await this.trelloClient.executeBulkOperations(operations);

    const text =
      `📦 Archivage en masse terminé!\n\n` +
      `Total: ${args.cardIds.length} cartes\n` +
      `✅ Succès: ${results.success}\n` +
      `❌ Échecs: ${results.failed}\n` +
      `${
        results.errors.length > 0
          ? `\n⚠️ Erreurs:\n${results.errors.map((e) => `- ${e.cardId}: ${e.error}`).join('\n')}`
          : ''
      }\n\n` +
      `💡 Les cartes archivées peuvent être restaurées avec unarchive_card`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: Bulk move cards
 */
export class BulkMoveCardsHandler extends BaseToolHandler<
  { cardIds: string[]; targetListId: string; position?: 'top' | 'bottom' },
  BulkResult
> {
  async execute(args: {
    cardIds: string[];
    targetListId: string;
    position?: 'top' | 'bottom';
  }): Promise<ToolResult> {
    this.validate(args);

    const results: BulkResult = { success: 0, failed: 0, errors: [] };

    // Create operations
    const operations = args.cardIds.map(
      (cardId) => async () => {
        try {
          await this.trelloClient.moveCard(cardId, args.targetListId, args.position);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            cardId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    );

    // Execute with rate limiting
    await this.trelloClient.executeBulkOperations(operations);

    const text =
      `🚚 Déplacement en masse terminé!\n\n` +
      `Total: ${args.cardIds.length} cartes\n` +
      `Liste de destination: ${args.targetListId}\n` +
      `Position: ${args.position || 'bottom'}\n` +
      `✅ Succès: ${results.success}\n` +
      `❌ Échecs: ${results.failed}\n` +
      `${
        results.errors.length > 0
          ? `\n⚠️ Erreurs:\n${results.errors.map((e) => `- ${e.cardId}: ${e.error}`).join('\n')}`
          : ''
      }\n\n` +
      `💡 Utilisez list_trello_cards pour vérifier les cartes déplacées`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: Bulk add label to cards
 */
export class BulkAddLabelHandler extends BaseToolHandler<
  { cardIds: string[]; labelId: string },
  BulkResult
> {
  async execute(args: { cardIds: string[]; labelId: string }): Promise<ToolResult> {
    this.validate(args);

    const results: BulkResult = { success: 0, failed: 0, errors: [] };

    // Create operations
    const operations = args.cardIds.map(
      (cardId) => async () => {
        try {
          await this.trelloClient.addLabelToCard(cardId, args.labelId);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            cardId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    );

    // Execute with rate limiting
    await this.trelloClient.executeBulkOperations(operations);

    const text =
      `🏷️ Ajout de label en masse terminé!\n\n` +
      `Total: ${args.cardIds.length} cartes\n` +
      `Label ID: ${args.labelId}\n` +
      `✅ Succès: ${results.success}\n` +
      `❌ Échecs: ${results.failed}\n` +
      `${
        results.errors.length > 0
          ? `\n⚠️ Erreurs:\n${results.errors.map((e) => `- ${e.cardId}: ${e.error}`).join('\n')}`
          : ''
      }\n\n` +
      `💡 Utilisez list_labels pour voir tous les labels disponibles`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: Bulk assign member to cards
 */
export class BulkAssignMemberHandler extends BaseToolHandler<
  { cardIds: string[]; memberId: string },
  BulkResult
> {
  async execute(args: { cardIds: string[]; memberId: string }): Promise<ToolResult> {
    this.validate(args);

    const results: BulkResult = { success: 0, failed: 0, errors: [] };

    // Create operations
    const operations = args.cardIds.map(
      (cardId) => async () => {
        try {
          await this.trelloClient.addMemberToCard(cardId, args.memberId);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            cardId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    );

    // Execute with rate limiting
    await this.trelloClient.executeBulkOperations(operations);

    const text =
      `👥 Assignation en masse terminée!\n\n` +
      `Total: ${args.cardIds.length} cartes\n` +
      `Membre ID: ${args.memberId}\n` +
      `✅ Succès: ${results.success}\n` +
      `❌ Échecs: ${results.failed}\n` +
      `${
        results.errors.length > 0
          ? `\n⚠️ Erreurs:\n${results.errors.map((e) => `- ${e.cardId}: ${e.error}`).join('\n')}`
          : ''
      }\n\n` +
      `💡 Utilisez get_board_members pour voir tous les membres disponibles`;

    return this.formatResponse(text);
  }
}
