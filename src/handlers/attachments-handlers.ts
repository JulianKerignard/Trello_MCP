/**
 * Attachment Handlers
 * Handlers for managing attachments on Trello cards
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloAttachment, TrelloCard } from '../types.js';

/**
 * Helper: Format bytes to human-readable string
 */
function formatBytes(bytes: number | string | undefined): string {
  if (!bytes) return 'Taille inconnue';
  const parsed = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(parsed)) return 'Taille inconnue';
  if (parsed < 1024) return `${parsed} B`;
  if (parsed < 1024 * 1024) return `${(parsed / 1024).toFixed(2)} KB`;
  return `${(parsed / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Handler: Add attachment to card via URL
 */
export class AddAttachmentUrlHandler extends BaseToolHandler<
  { cardId: string; url: string; name?: string; setCover?: boolean },
  TrelloAttachment
> {
  async execute(args: {
    cardId: string;
    url: string;
    name?: string;
    setCover?: boolean;
  }): Promise<ToolResult> {
    this.validate(args);

    const attachment = await this.trelloClient.addAttachmentUrl(
      args.cardId,
      args.url,
      args.name,
      args.setCover
    );

    const text =
      `📎 Attachment ajouté avec succès!\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Nom: ${attachment.name}\n` +
      `URL: ${attachment.url}\n` +
      `Taille: ${formatBytes(attachment.bytes)}\n` +
      `${attachment.mimeType ? `Type: ${attachment.mimeType}\n` : ''}` +
      `${args.setCover ? '🖼️ Défini comme cover de carte\n' : ''}` +
      `\n💡 Utilisez list_attachments pour voir tous les attachments`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: List all attachments on a card
 */
export class ListAttachmentsHandler extends BaseToolHandler<
  { cardId: string },
  TrelloAttachment[]
> {
  async execute(args: { cardId: string }): Promise<ToolResult> {
    this.validate(args);

    const attachments = await this.trelloClient.getAttachments(args.cardId);

    if (attachments.length === 0) {
      return this.formatResponse(
        `📎 Aucun attachment trouvé sur cette carte.\n\nCarte ID: ${args.cardId}\n\n💡 Utilisez add_attachment_url pour ajouter un attachment`
      );
    }

    const text =
      `📎 Attachments trouvés: ${attachments.length}\n\n` +
      `Carte ID: ${args.cardId}\n\n` +
      attachments
        .map(
          (att, index) =>
            `${index + 1}. ${att.name}\n` +
            `   - ID: ${att.id}\n` +
            `   - URL: ${att.url}\n` +
            `   - Taille: ${formatBytes(att.bytes)}\n` +
            `   ${att.mimeType ? `- Type: ${att.mimeType}\n` : ''}` +
            `   - Date: ${new Date(att.date).toLocaleString('fr-FR')}`
        )
        .join('\n\n') +
      `\n\n💡 Utilisez delete_attachment pour supprimer un attachment`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: Delete attachment from card
 */
export class DeleteAttachmentHandler extends BaseToolHandler<
  { cardId: string; attachmentId: string },
  void
> {
  async execute(args: { cardId: string; attachmentId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.deleteAttachment(args.cardId, args.attachmentId);

    const text =
      `🗑️ Attachment supprimé définitivement!\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Attachment ID: ${args.attachmentId}\n\n` +
      `⚠️ Le fichier a été supprimé d'Amazon S3 (irréversible)`;

    return this.formatResponse(text);
  }
}

/**
 * Handler: Set or remove card cover
 */
export class SetCardCoverHandler extends BaseToolHandler<
  { cardId: string; attachmentId?: string },
  TrelloCard
> {
  async execute(args: { cardId: string; attachmentId?: string }): Promise<ToolResult> {
    this.validate(args);

    const card = await this.trelloClient.setCardCover(args.cardId, args.attachmentId || null);

    const text = args.attachmentId
      ? `🖼️ Cover de carte défini!\n\n` +
        `Carte: ${card.name}\n` +
        `URL: ${card.url}\n` +
        `Attachment ID: ${args.attachmentId}\n\n` +
        `✅ L'image s'affiche maintenant comme cover de carte`
      : `🖼️ Cover de carte retiré!\n\n` +
        `Carte: ${card.name}\n` +
        `URL: ${card.url}\n\n` +
        `✅ La carte n'a plus de cover`;

    return this.formatResponse(text);
  }
}
