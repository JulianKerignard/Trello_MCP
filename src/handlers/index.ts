/**
 * Handler Registration
 * Centralized registration of all tool handlers
 */

import { ToolRegistry } from './tool-registry.js';
import { TrelloClient } from '../trello-client.js';

// Board handlers
import {
  ListBoardsHandler,
  CreateBoardHandler,
  CloseBoardHandler,
  ReopenBoardHandler,
  DeleteBoardHandler
} from './boards-handlers.js';

// List handlers
import { ListListsHandler, CreateListHandler } from './lists-handlers.js';

// Label handlers
import {
  ListLabelsHandler,
  CreateLabelHandler,
  UpdateLabelHandler,
  AddLabelToCardHandler,
  RemoveLabelFromCardHandler
} from './labels-handlers.js';

// Date handlers
import {
  SetCardDueDateHandler,
  RemoveCardDueDateHandler,
  MarkDueDateCompleteHandler,
  ListCardsByDueDateHandler
} from './dates-handlers.js';

// Member handlers
import {
  GetBoardMembersHandler,
  AddMemberToCardHandler,
  RemoveMemberFromCardHandler,
  GetMemberCardsHandler
} from './members-handlers.js';

// Checklist handlers
import {
  AddChecklistToCardHandler,
  AddChecklistItemHandler,
  CheckChecklistItemHandler,
  GetChecklistProgressHandler,
  DeleteChecklistHandler
} from './checklists-handlers.js';

// Card handlers
import {
  ListCardsHandler,
  CreateCardHandler,
  AddCardCommentHandler,
  MoveCardHandler,
  SearchCardsHandler,
  UpdateCardDescriptionHandler,
  ArchiveCardHandler,
  DeleteCardHandler,
  UnarchiveCardHandler,
  UpdateCardNameHandler,
  GetCardDetailsHandler,
  DuplicateCardHandler
} from './cards-handlers.js';

// Attachment handlers
import {
  AddAttachmentUrlHandler,
  ListAttachmentsHandler,
  DeleteAttachmentHandler,
  SetCardCoverHandler
} from './attachments-handlers.js';

// Bulk operation handlers
import {
  BulkArchiveCardsHandler,
  BulkMoveCardsHandler,
  BulkAddLabelHandler,
  BulkAssignMemberHandler
} from './bulk-handlers.js';

/**
 * Register all tool handlers with the registry
 * @param registry - The tool registry instance
 * @param client - The Trello client instance
 */
export function registerAllHandlers(registry: ToolRegistry, client: TrelloClient): void {
  // ========== Boards (5 tools) ==========

  registry.register(
    'list_trello_boards',
    new ListBoardsHandler(client, {
      name: 'list_trello_boards',
      category: 'boards',
      description: "Liste tous les boards Trello accessibles à l'utilisateur authentifié",
      validation: []
    })
  );

  registry.register(
    'create_trello_board',
    new CreateBoardHandler(client, {
      name: 'create_trello_board',
      category: 'boards',
      description: 'Crée un nouveau board Trello',
      validation: [
        { param: 'name', required: true, type: 'string', minLength: 1 },
        { param: 'desc', required: false, type: 'string' }
      ]
    })
  );

  registry.register(
    'close_board',
    new CloseBoardHandler(client, {
      name: 'close_board',
      category: 'boards',
      description: 'Archive un board Trello (réversible, peut être réouvert)',
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'reopen_board',
    new ReopenBoardHandler(client, {
      name: 'reopen_board',
      category: 'boards',
      description: 'Réouvre un board Trello archivé',
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'delete_board',
    new DeleteBoardHandler(client, {
      name: 'delete_board',
      category: 'boards',
      description:
        '⚠️ SUPPRIME DÉFINITIVEMENT un board Trello (IRRÉVERSIBLE). Recommandation: archivez d\'abord avec close_board',
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  // ========== Lists (2 tools) ==========

  registry.register(
    'list_trello_lists',
    new ListListsHandler(client, {
      name: 'list_trello_lists',
      category: 'lists',
      description: "Liste toutes les lists (colonnes) d'un board Trello spécifique",
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'create_trello_list',
    new CreateListHandler(client, {
      name: 'create_trello_list',
      category: 'lists',
      description: 'Crée une nouvelle list (colonne) sur un board Trello',
      validation: [
        { param: 'boardId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string', minLength: 1 }
      ]
    })
  );

  // ========== Labels (5 tools) ==========

  registry.register(
    'list_labels',
    new ListLabelsHandler(client, {
      name: 'list_labels',
      category: 'labels',
      description: "Liste tous les labels d'un board Trello",
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'create_label',
    new CreateLabelHandler(client, {
      name: 'create_label',
      category: 'labels',
      description: 'Crée un nouveau label sur un board Trello',
      validation: [
        { param: 'boardId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string' },
        { param: 'color', required: true, type: 'string' }
      ]
    })
  );

  registry.register(
    'update_label',
    new UpdateLabelHandler(client, {
      name: 'update_label',
      category: 'labels',
      description: 'Modifie un label existant (nom et/ou couleur)',
      validation: [
        { param: 'labelId', required: true, type: 'string', length: 24 },
        { param: 'name', required: false, type: 'string' },
        { param: 'color', required: false, type: 'string' }
      ]
    })
  );

  registry.register(
    'add_label_to_card',
    new AddLabelToCardHandler(client, {
      name: 'add_label_to_card',
      category: 'labels',
      description: 'Ajoute un label à une carte Trello',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'labelId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  registry.register(
    'remove_label_from_card',
    new RemoveLabelFromCardHandler(client, {
      name: 'remove_label_from_card',
      category: 'labels',
      description: "Retire un label d'une carte Trello",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'labelId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  // ========== Dates (4 tools) ==========

  registry.register(
    'set_card_due_date',
    new SetCardDueDateHandler(client, {
      name: 'set_card_due_date',
      category: 'dates',
      description: 'Définit une date limite (deadline) sur une carte Trello',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        {
          param: 'dueDate',
          required: true,
          type: 'string',
          pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
        }
      ]
    })
  );

  registry.register(
    'remove_card_due_date',
    new RemoveCardDueDateHandler(client, {
      name: 'remove_card_due_date',
      category: 'dates',
      description: "Retire la date limite d'une carte Trello",
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'mark_due_date_complete',
    new MarkDueDateCompleteHandler(client, {
      name: 'mark_due_date_complete',
      category: 'dates',
      description: "Marque la date limite d'une carte comme complétée (ou non complétée)",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'complete', required: false, type: 'boolean' }
      ]
    })
  );

  registry.register(
    'list_cards_by_due_date',
    new ListCardsByDueDateHandler(client, {
      name: 'list_cards_by_due_date',
      category: 'dates',
      description:
        "Liste toutes les cartes d'un board qui ont une date limite, triées par échéance (les plus urgentes en premier)",
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  // ========== Members (4 tools) ==========

  registry.register(
    'get_board_members',
    new GetBoardMembersHandler(client, {
      name: 'get_board_members',
      category: 'members',
      description: "Liste tous les membres d'un board Trello avec leurs informations",
      validation: [{ param: 'boardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'add_member_to_card',
    new AddMemberToCardHandler(client, {
      name: 'add_member_to_card',
      category: 'members',
      description: 'Assigne un membre à une carte Trello',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'memberId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  registry.register(
    'remove_member_from_card',
    new RemoveMemberFromCardHandler(client, {
      name: 'remove_member_from_card',
      category: 'members',
      description: "Retire l'assignation d'un membre d'une carte Trello",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'memberId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  registry.register(
    'get_member_cards',
    new GetMemberCardsHandler(client, {
      name: 'get_member_cards',
      category: 'members',
      description:
        'Liste toutes les cartes assignées à un membre, optionnellement filtrées par board',
      validation: [
        { param: 'memberId', required: true, type: 'string', length: 24 },
        { param: 'boardId', required: false, type: 'string', length: 24 }
      ]
    })
  );

  // ========== Attachments (4 tools) ==========

  registry.register(
    'add_attachment_url',
    new AddAttachmentUrlHandler(client, {
      name: 'add_attachment_url',
      category: 'attachments',
      description: 'Ajoute un attachment à une carte via URL',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        {
          param: 'url',
          required: true,
          type: 'string',
          pattern: /^https?:\/\/.+/
        },
        { param: 'name', required: false, type: 'string' },
        { param: 'setCover', required: false, type: 'boolean' }
      ]
    })
  );

  registry.register(
    'list_attachments',
    new ListAttachmentsHandler(client, {
      name: 'list_attachments',
      category: 'attachments',
      description: "Liste tous les attachments d'une carte",
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'delete_attachment',
    new DeleteAttachmentHandler(client, {
      name: 'delete_attachment',
      category: 'attachments',
      description: '⚠️ Supprime définitivement un attachment (irréversible)',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'attachmentId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  registry.register(
    'set_card_cover',
    new SetCardCoverHandler(client, {
      name: 'set_card_cover',
      category: 'attachments',
      description: "Définit ou retire le cover d'une carte (via attachment)",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'attachmentId', required: false, type: 'string', length: 24 }
      ]
    })
  );

  // ========== Checklists (5 tools) ==========

  registry.register(
    'add_checklist_to_card',
    new AddChecklistToCardHandler(client, {
      name: 'add_checklist_to_card',
      category: 'checklists',
      description: 'Crée une nouvelle checklist sur une carte Trello',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string', minLength: 1 },
        { param: 'pos', required: false, type: 'string', enum: ['top', 'bottom'] }
      ]
    })
  );

  registry.register(
    'add_checklist_item',
    new AddChecklistItemHandler(client, {
      name: 'add_checklist_item',
      category: 'checklists',
      description: 'Ajoute un item à une checklist existante',
      validation: [
        { param: 'checklistId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string', minLength: 1 },
        { param: 'pos', required: false, type: 'string', enum: ['top', 'bottom'] },
        { param: 'checked', required: false, type: 'boolean' }
      ]
    })
  );

  registry.register(
    'check_checklist_item',
    new CheckChecklistItemHandler(client, {
      name: 'check_checklist_item',
      category: 'checklists',
      description: "Coche ou décoche un item d'une checklist",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'checkItemId', required: true, type: 'string', length: 24 },
        { param: 'state', required: true, type: 'string', enum: ['complete', 'incomplete'] }
      ]
    })
  );

  registry.register(
    'get_checklist_progress',
    new GetChecklistProgressHandler(client, {
      name: 'get_checklist_progress',
      category: 'checklists',
      description:
        "Récupère la progression de toutes les checklists d'une carte avec statistiques détaillées",
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'delete_checklist',
    new DeleteChecklistHandler(client, {
      name: 'delete_checklist',
      category: 'checklists',
      description: '⚠️ SUPPRIME DÉFINITIVEMENT une checklist (irréversible)',
      validation: [{ param: 'checklistId', required: true, type: 'string', length: 24 }]
    })
  );

  // ========== Cards (11 tools) ==========

  registry.register(
    'list_trello_cards',
    new ListCardsHandler(client, {
      name: 'list_trello_cards',
      category: 'cards',
      description: "Liste toutes les cartes (cards) d'une list Trello spécifique",
      validation: [{ param: 'listId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'create_trello_card',
    new CreateCardHandler(client, {
      name: 'create_trello_card',
      category: 'cards',
      description: 'Crée une nouvelle carte dans une list Trello',
      validation: [
        { param: 'listId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string', minLength: 1 },
        { param: 'desc', required: false, type: 'string' }
      ]
    })
  );

  registry.register(
    'add_card_comment',
    new AddCardCommentHandler(client, {
      name: 'add_card_comment',
      category: 'cards',
      description: 'Ajoute un commentaire à une carte Trello',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'text', required: true, type: 'string', minLength: 1 }
      ]
    })
  );

  registry.register(
    'move_trello_card',
    new MoveCardHandler(client, {
      name: 'move_trello_card',
      category: 'cards',
      description: 'Déplace une carte Trello vers une autre list et/ou change sa position',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'targetListId', required: true, type: 'string', length: 24 },
        { param: 'position', required: false, type: 'string', enum: ['top', 'bottom'] }
      ]
    })
  );

  registry.register(
    'search_trello_cards',
    new SearchCardsHandler(client, {
      name: 'search_trello_cards',
      category: 'cards',
      description: 'Recherche des cartes Trello par nom, description ou autres critères',
      validation: [
        { param: 'query', required: true, type: 'string', minLength: 1 },
        { param: 'boardIds', required: false, type: 'array' },
        { param: 'limit', required: false, type: 'number' },
        { param: 'partial', required: false, type: 'boolean' }
      ]
    })
  );

  registry.register(
    'update_card_description',
    new UpdateCardDescriptionHandler(client, {
      name: 'update_card_description',
      category: 'cards',
      description: "Met à jour la description d'une carte Trello existante",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'description', required: true, type: 'string' }
      ]
    })
  );

  registry.register(
    'archive_card',
    new ArchiveCardHandler(client, {
      name: 'archive_card',
      category: 'cards',
      description: 'Archive une carte Trello (réversible, peut être désarchivée)',
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'delete_card',
    new DeleteCardHandler(client, {
      name: 'delete_card',
      category: 'cards',
      description:
        "⚠️ SUPPRIME DÉFINITIVEMENT une carte Trello (IRRÉVERSIBLE). Recommandation: archivez d'abord avec archive_card",
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'unarchive_card',
    new UnarchiveCardHandler(client, {
      name: 'unarchive_card',
      category: 'cards',
      description: 'Désarchive une carte Trello (set closed to false)',
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'update_card_name',
    new UpdateCardNameHandler(client, {
      name: 'update_card_name',
      category: 'cards',
      description: "Modifie le nom/titre d'une carte Trello",
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'name', required: true, type: 'string', minLength: 1 }
      ]
    })
  );

  registry.register(
    'get_card_details',
    new GetCardDetailsHandler(client, {
      name: 'get_card_details',
      category: 'cards',
      description:
        "Récupère tous les détails d'une carte (membres, labels, checklists, dates, pièces jointes, etc.)",
      validation: [{ param: 'cardId', required: true, type: 'string', length: 24 }]
    })
  );

  registry.register(
    'duplicate_card',
    new DuplicateCardHandler(client, {
      name: 'duplicate_card',
      category: 'cards',
      description: 'Duplique une carte avec options sélectives (attachments, checklists, labels, etc.)',
      validation: [
        { param: 'cardId', required: true, type: 'string', length: 24 },
        { param: 'targetListId', required: true, type: 'string', length: 24 },
        { param: 'keepAttachments', required: false, type: 'boolean' },
        { param: 'keepChecklists', required: false, type: 'boolean' },
        { param: 'keepComments', required: false, type: 'boolean' },
        { param: 'keepLabels', required: false, type: 'boolean' },
        { param: 'keepMembers', required: false, type: 'boolean' },
        { param: 'keepDue', required: false, type: 'boolean' },
        { param: 'newName', required: false, type: 'string', minLength: 1 },
        { param: 'newDesc', required: false, type: 'string' },
        { param: 'position', required: false, type: 'string', enum: ['top', 'bottom'] }
      ]
    })
  );

  // ========== Bulk Operations (4 tools) ==========

  registry.register(
    'bulk_archive_cards',
    new BulkArchiveCardsHandler(client, {
      name: 'bulk_archive_cards',
      category: 'bulk',
      description: 'Archive plusieurs cartes en une fois (batch processing avec rate limiting)',
      validation: [{ param: 'cardIds', required: true, type: 'array' }]
    })
  );

  registry.register(
    'bulk_move_cards',
    new BulkMoveCardsHandler(client, {
      name: 'bulk_move_cards',
      category: 'bulk',
      description: 'Déplace plusieurs cartes vers une liste en une fois',
      validation: [
        { param: 'cardIds', required: true, type: 'array' },
        { param: 'targetListId', required: true, type: 'string', length: 24 },
        { param: 'position', required: false, type: 'string', enum: ['top', 'bottom'] }
      ]
    })
  );

  registry.register(
    'bulk_add_label',
    new BulkAddLabelHandler(client, {
      name: 'bulk_add_label',
      category: 'bulk',
      description: 'Ajoute un label à plusieurs cartes en une fois',
      validation: [
        { param: 'cardIds', required: true, type: 'array' },
        { param: 'labelId', required: true, type: 'string', length: 24 }
      ]
    })
  );

  registry.register(
    'bulk_assign_member',
    new BulkAssignMemberHandler(client, {
      name: 'bulk_assign_member',
      category: 'bulk',
      description: 'Assigne un membre à plusieurs cartes en une fois',
      validation: [
        { param: 'cardIds', required: true, type: 'array' },
        { param: 'memberId', required: true, type: 'string', length: 24 }
      ]
    })
  );
}
