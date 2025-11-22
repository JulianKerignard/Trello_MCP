/**
 * Member Handlers
 * Handlers for member-related Trello operations
 */

import { BaseToolHandler } from './base-handler.js';
import { ToolResult } from './types.js';
import type { TrelloMember, TrelloCard } from '../types.js';

/**
 * Get all members of a board
 */
export class GetBoardMembersHandler extends BaseToolHandler<{ boardId: string }, TrelloMember[]> {
  async execute(args: { boardId: string }): Promise<ToolResult> {
    this.validate(args);

    const members = await this.trelloClient.getBoardMembers(args.boardId);

    if (members.length === 0) {
      return this.formatResponse('Aucun membre trouvé sur ce board.');
    }

    let output = `👥 Membres du Board (${members.length})\n\n`;
    members.forEach((member, index) => {
      output += `${index + 1}. ${member.fullName} (@${member.username})\n`;
      output += `   ID: ${member.id}\n\n`;
    });

    return this.formatResponse(output);
  }
}

/**
 * Add a member to a card (assign)
 */
export class AddMemberToCardHandler extends BaseToolHandler<
  { cardId: string; memberId: string },
  TrelloMember[]
> {
  async execute(args: { cardId: string; memberId: string }): Promise<ToolResult> {
    this.validate(args);

    // Get card details before assignment to display card name
    const card = await this.trelloClient.getCard(args.cardId);

    // Add member to card (returns array of members)
    const members = await this.trelloClient.addMemberToCard(args.cardId, args.memberId);
    const addedMember = members[0]; // API returns array with added member

    const text =
      `👤 Membre assigné à la carte!\n\n` +
      `Carte: ${card.name}\n` +
      `Carte ID: ${card.id}\n` +
      `Membre: ${addedMember.fullName} (@${addedMember.username})\n` +
      `URL: ${card.url}`;

    return this.formatResponse(text);
  }
}

/**
 * Remove a member from a card (unassign)
 */
export class RemoveMemberFromCardHandler extends BaseToolHandler<
  { cardId: string; memberId: string },
  void
> {
  async execute(args: { cardId: string; memberId: string }): Promise<ToolResult> {
    this.validate(args);

    await this.trelloClient.removeMemberFromCard(args.cardId, args.memberId);

    const text =
      `👤 Membre retiré de la carte!\n\n` +
      `Carte ID: ${args.cardId}\n` +
      `Membre ID: ${args.memberId}`;

    return this.formatResponse(text);
  }
}

/**
 * Get all cards assigned to a member
 */
export class GetMemberCardsHandler extends BaseToolHandler<
  { memberId: string; boardId?: string },
  TrelloCard[]
> {
  async execute(args: { memberId: string; boardId?: string }): Promise<ToolResult> {
    this.validate(args);

    const cards = await this.trelloClient.getMemberCards(args.memberId, args.boardId);

    if (cards.length === 0) {
      return this.formatResponse(
        args.boardId
          ? 'Aucune carte assignée à ce membre sur ce board.'
          : 'Aucune carte assignée à ce membre.'
      );
    }

    let output = `📋 Cartes assignées${args.boardId ? ' (filtrées par board)' : ''} (${cards.length})\n\n`;
    cards.forEach((card, index) => {
      const dueInfo = card.due ? ` | Due: ${new Date(card.due).toLocaleDateString('fr-FR')}` : '';
      const labelsInfo =
        card.labels && card.labels.length > 0
          ? ` | Labels: ${card.labels.map((l) => l.name || l.color).join(', ')}`
          : '';

      output += `${index + 1}. ${card.name}${dueInfo}${labelsInfo}\n`;
      output += `   URL: ${card.shortUrl}\n\n`;
    });

    return this.formatResponse(output);
  }
}
