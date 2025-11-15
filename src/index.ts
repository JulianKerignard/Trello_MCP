#!/usr/bin/env node

/**
 * Trello MCP Server v1.0
 * Model Context Protocol server for Trello API integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { TrelloClient } from './trello-client.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const apiKey = process.env.TRELLO_API_KEY;
const apiToken = process.env.TRELLO_API_TOKEN;

if (!apiKey || !apiToken) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes');
  console.error('');
  console.error('TRELLO_API_KEY et TRELLO_API_TOKEN doivent être définis.');
  console.error('');
  console.error('Pour obtenir vos credentials:');
  console.error('1. Visitez https://trello.com/power-ups/admin');
  console.error('2. Créez un Power-Up (si nécessaire)');
  console.error('3. Générez une API Key');
  console.error('4. Générez un Token avec les permissions read et write');
  console.error('');
  console.error('Puis configurez votre fichier .env ou Claude Desktop config.');
  process.exit(1);
}

// Create Trello client
let trelloClient: TrelloClient;
try {
  trelloClient = new TrelloClient(apiKey, apiToken);
} catch (error: any) {
  console.error('❌ ERREUR lors de l\'initialisation du client Trello:');
  console.error(error.message);
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'trello-mcp-server',
    version: '1.3.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Board tools
      {
        name: 'list_trello_boards',
        description: 'Liste tous les boards Trello accessibles à l\'utilisateur authentifié',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'create_trello_board',
        description: 'Crée un nouveau board Trello',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nom du board (requis)'
            },
            desc: {
              type: 'string',
              description: 'Description du board (optionnel)'
            }
          },
          required: ['name']
        }
      },
      // List tools
      {
        name: 'list_trello_lists',
        description: 'Liste toutes les lists (colonnes) d\'un board Trello spécifique',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'ID du board Trello (requis)'
            }
          },
          required: ['boardId']
        }
      },
      {
        name: 'create_trello_list',
        description: 'Crée une nouvelle list (colonne) sur un board Trello',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'ID du board où créer la list (requis)'
            },
            name: {
              type: 'string',
              description: 'Nom de la list (requis)'
            }
          },
          required: ['boardId', 'name']
        }
      },
      // Card tools
      {
        name: 'list_trello_cards',
        description: 'Liste toutes les cards (cartes) d\'une list Trello spécifique',
        inputSchema: {
          type: 'object',
          properties: {
            listId: {
              type: 'string',
              description: 'ID de la list Trello (requis)'
            }
          },
          required: ['listId']
        }
      },
      {
        name: 'create_trello_card',
        description: 'Crée une nouvelle card (carte) dans une list Trello',
        inputSchema: {
          type: 'object',
          properties: {
            listId: {
              type: 'string',
              description: 'ID de la list où créer la card (requis)'
            },
            name: {
              type: 'string',
              description: 'Nom de la card (requis)'
            },
            desc: {
              type: 'string',
              description: 'Description de la card (optionnel)'
            }
          },
          required: ['listId', 'name']
        }
      },
      {
        name: 'add_card_comment',
        description: 'Ajoute un commentaire à une card Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la card où ajouter le commentaire (requis)'
            },
            text: {
              type: 'string',
              description: 'Texte du commentaire (requis)'
            }
          },
          required: ['cardId', 'text']
        }
      },
      {
        name: 'move_trello_card',
        description: 'Déplace une carte Trello vers une autre list et/ou change sa position',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à déplacer (requis, 24 caractères)'
            },
            targetListId: {
              type: 'string',
              description: 'ID de la list de destination (requis, 24 caractères)'
            },
            position: {
              type: 'string',
              description: 'Position dans la list: "top", "bottom" (optionnel, défaut: "top")',
              enum: ['top', 'bottom']
            }
          },
          required: ['cardId', 'targetListId']
        }
      },
      {
        name: 'search_trello_cards',
        description: 'Recherche des cartes Trello par nom, description ou autres critères',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Terme de recherche (requis). Supporte syntaxe avancée: name:"Task", description:"bug", is:open'
            },
            boardIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Liste des IDs de boards pour limiter la recherche (optionnel)'
            },
            limit: {
              type: 'number',
              description: 'Nombre maximum de résultats (optionnel, défaut: 25, max: 1000)',
              minimum: 1,
              maximum: 1000
            },
            partial: {
              type: 'boolean',
              description: 'Active le matching partiel (optionnel, défaut: false)'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'update_card_description',
        description: 'Met à jour la description d\'une carte Trello existante',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à modifier (requis, 24 caractères)'
            },
            description: {
              type: 'string',
              description: 'Nouvelle description de la carte (requis, peut être vide pour effacer)'
            }
          },
          required: ['cardId', 'description']
        }
      },
      {
        name: 'archive_card',
        description: 'Archive une carte Trello (réversible, peut être désarchivée)',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à archiver (requis, 24 caractères)'
            }
          },
          required: ['cardId']
        }
      },
      {
        name: 'delete_card',
        description: '⚠️ SUPPRIME DÉFINITIVEMENT une carte Trello (IRRÉVERSIBLE). Recommandation: archivez d\'abord avec archive_card',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à supprimer définitivement (requis, 24 caractères)'
            }
          },
          required: ['cardId']
        }
      },
      // v1.4 - New card tools
      {
        name: 'unarchive_card',
        description: 'Désarchive une carte Trello (set closed to false)',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à désarchiver (requis, 24 caractères)'
            }
          },
          required: ['cardId']
        }
      },
      {
        name: 'update_card_name',
        description: 'Modifie le nom/titre d\'une carte Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte à renommer (requis, 24 caractères)'
            },
            name: {
              type: 'string',
              description: 'Nouveau nom de la carte (requis)'
            }
          },
          required: ['cardId', 'name']
        }
      },
      {
        name: 'get_card_details',
        description: 'Récupère tous les détails d\'une carte (membres, labels, checklists, dates, pièces jointes, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            }
          },
          required: ['cardId']
        }
      },
      // v1.4 - Label tools
      {
        name: 'list_labels',
        description: 'Liste tous les labels d\'un board Trello',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'ID du board (requis, 24 caractères)'
            }
          },
          required: ['boardId']
        }
      },
      {
        name: 'create_label',
        description: 'Crée un nouveau label sur un board Trello (pour catégorisation, priorités P1-P4, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'ID du board (requis, 24 caractères)'
            },
            name: {
              type: 'string',
              description: 'Nom du label (ex: "P1 - Critique", "Bug", "Feature")'
            },
            color: {
              type: 'string',
              description: 'Couleur du label: red, orange, yellow, green, blue, purple, pink, sky, lime, black, null'
            }
          },
          required: ['boardId', 'name', 'color']
        }
      },
      {
        name: 'update_label',
        description: 'Modifie un label existant (nom et/ou couleur)',
        inputSchema: {
          type: 'object',
          properties: {
            labelId: {
              type: 'string',
              description: 'ID du label à modifier (requis, 24 caractères)'
            },
            name: {
              type: 'string',
              description: 'Nouveau nom du label (optionnel)'
            },
            color: {
              type: 'string',
              description: 'Nouvelle couleur du label (optionnel)'
            }
          },
          required: ['labelId']
        }
      },
      {
        name: 'add_label_to_card',
        description: 'Ajoute un label à une carte Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            },
            labelId: {
              type: 'string',
              description: 'ID du label à ajouter (requis, 24 caractères)'
            }
          },
          required: ['cardId', 'labelId']
        }
      },
      {
        name: 'remove_label_from_card',
        description: 'Retire un label d\'une carte Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            },
            labelId: {
              type: 'string',
              description: 'ID du label à retirer (requis, 24 caractères)'
            }
          },
          required: ['cardId', 'labelId']
        }
      },
      // v1.4 - Due date tools
      {
        name: 'set_card_due_date',
        description: 'Définit une date limite (deadline) sur une carte Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            },
            dueDate: {
              type: 'string',
              description: 'Date limite au format ISO 8601 (ex: "2025-12-31T23:59:59.999Z")'
            }
          },
          required: ['cardId', 'dueDate']
        }
      },
      {
        name: 'remove_card_due_date',
        description: 'Retire la date limite d\'une carte Trello',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            }
          },
          required: ['cardId']
        }
      },
      {
        name: 'mark_due_date_complete',
        description: 'Marque la date limite d\'une carte comme complétée (ou non complétée)',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: 'ID de la carte (requis, 24 caractères)'
            },
            complete: {
              type: 'boolean',
              description: 'true pour marquer comme complété, false sinon (défaut: true)'
            }
          },
          required: ['cardId']
        }
      },
      {
        name: 'list_cards_by_due_date',
        description: 'Liste toutes les cartes d\'un board qui ont une date limite, triées par échéance (les plus urgentes en premier)',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'ID du board (requis, 24 caractères)'
            }
          },
          required: ['boardId']
        }
      }
    ]
  };
});

/**
 * Handler for calling tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Board tools
    if (name === 'list_trello_boards') {
      const boards = await trelloClient.getBoards();
      const boardList = boards.map(board => ({
        id: board.id,
        name: board.name,
        url: board.url,
        description: board.desc,
        closed: board.closed
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(boardList, null, 2)
          }
        ]
      };
    }

    if (name === 'create_trello_board') {
      const { name: boardName, desc } = args as { name: string; desc?: string };

      if (!boardName) {
        throw new Error('Le paramètre "name" est requis pour créer un board.');
      }

      const board = await trelloClient.createBoard(boardName, desc);

      return {
        content: [
          {
            type: 'text',
            text: `Board créé avec succès!\n\nID: ${board.id}\nNom: ${board.name}\nURL: ${board.url}\nDescription: ${board.desc || '(aucune)'}`
          }
        ]
      };
    }

    // List tools
    if (name === 'list_trello_lists') {
      const { boardId } = args as { boardId: string };

      if (!boardId) {
        throw new Error('Le paramètre "boardId" est requis pour lister les lists.');
      }

      const lists = await trelloClient.getLists(boardId);
      const listData = lists.map(list => ({
        id: list.id,
        name: list.name,
        boardId: list.idBoard,
        position: list.pos,
        closed: list.closed
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(listData, null, 2)
          }
        ]
      };
    }

    if (name === 'create_trello_list') {
      const { boardId, name: listName } = args as { boardId: string; name: string };

      if (!boardId || !listName) {
        throw new Error('Les paramètres "boardId" et "name" sont requis pour créer une list.');
      }

      const list = await trelloClient.createList(boardId, listName);

      return {
        content: [
          {
            type: 'text',
            text: `List créée avec succès!\n\nID: ${list.id}\nNom: ${list.name}\nBoard ID: ${list.idBoard}\nPosition: ${list.pos}`
          }
        ]
      };
    }

    // Card tools
    if (name === 'list_trello_cards') {
      const { listId } = args as { listId: string };

      if (!listId) {
        throw new Error('Le paramètre "listId" est requis pour lister les cards.');
      }

      const cards = await trelloClient.getCards(listId);
      const cardData = cards.map(card => ({
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

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cardData, null, 2)
          }
        ]
      };
    }

    if (name === 'create_trello_card') {
      const { listId, name: cardName, desc } = args as { listId: string; name: string; desc?: string };

      if (!listId || !cardName) {
        throw new Error('Les paramètres "listId" et "name" sont requis pour créer une card.');
      }

      const card = await trelloClient.createCard(listId, cardName, desc);

      return {
        content: [
          {
            type: 'text',
            text: `Card créée avec succès!\n\nID: ${card.id}\nNom: ${card.name}\nDescription: ${card.desc || '(aucune)'}\nURL: ${card.url}\nShort URL: ${card.shortUrl}`
          }
        ]
      };
    }

    if (name === 'add_card_comment') {
      const { cardId, text } = args as { cardId: string; text: string };

      if (!cardId || !text) {
        throw new Error('Les paramètres "cardId" et "text" sont requis pour ajouter un commentaire.');
      }

      const comment = await trelloClient.addComment(cardId, text);

      return {
        content: [
          {
            type: 'text',
            text: `Commentaire ajouté avec succès!\n\nID: ${comment.id}\nDate: ${comment.date}\nTexte: ${comment.data.text}\nAuteur: ${comment.memberCreator.fullName} (@${comment.memberCreator.username})`
          }
        ]
      };
    }

    if (name === 'move_trello_card') {
      const { cardId, targetListId, position } = args as {
        cardId: string;
        targetListId: string;
        position?: 'top' | 'bottom';
      };

      if (!cardId || !targetListId) {
        throw new Error(
          'Les paramètres "cardId" et "targetListId" sont requis pour déplacer une carte.'
        );
      }

      // Validation ID format (24 caractères)
      if (cardId.length !== 24 || targetListId.length !== 24) {
        throw new Error(
          'Les IDs doivent être des IDs complets (24 caractères), pas des short links.\n' +
          'Utilisez list_trello_cards pour obtenir les IDs complets.'
        );
      }

      const card = await trelloClient.moveCard(
        cardId,
        targetListId,
        position || 'top'
      );

      return {
        content: [
          {
            type: 'text',
            text: `Carte déplacée avec succès!\n\nID: ${card.id}\nNom: ${card.name}\nNouvelle List ID: ${card.idList}\nPosition: ${position || 'top'}\nURL: ${card.url}`
          }
        ]
      };
    }

    if (name === 'search_trello_cards') {
      const { query, boardIds, limit, partial } = args as {
        query: string;
        boardIds?: string[];
        limit?: number;
        partial?: boolean;
      };

      if (!query || query.trim() === '') {
        throw new Error('Le paramètre "query" ne peut pas être vide.');
      }

      const cards = await trelloClient.searchCards(query, {
        boardIds,
        cardLimit: limit,
        partial
      });

      if (cards.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Aucune carte trouvée pour la recherche: "${query}"`
            }
          ]
        };
      }

      const cardData = cards.map(card => ({
        id: card.id,
        name: card.name,
        description: card.desc,
        url: card.url,
        shortUrl: card.shortUrl,
        listId: card.idList,
        boardId: card.idBoard,
        closed: card.closed
      }));

      return {
        content: [
          {
            type: 'text',
            text: `${cards.length} carte(s) trouvée(s):\n\n${JSON.stringify(cardData, null, 2)}`
          }
        ]
      };
    }

    if (name === 'update_card_description') {
      const { cardId, description } = args as {
        cardId: string;
        description: string;
      };

      // Validation cardId requis
      if (!cardId) {
        throw new Error('Le paramètre "cardId" est requis pour modifier une carte.');
      }

      // Validation format ID (24 caractères)
      if (cardId.length !== 24) {
        throw new Error(
          'L\'ID de carte doit être un ID complet (24 caractères), pas un short link.\n' +
          'Utilisez list_trello_cards pour obtenir l\'ID complet de la carte.'
        );
      }

      // Validation description fournie (peut être vide string, mais pas undefined)
      if (description === undefined) {
        throw new Error('Le paramètre "description" est requis (utilisez "" pour effacer la description).');
      }

      // Appel API via TrelloClient
      const card = await trelloClient.updateCard(cardId, { desc: description });

      return {
        content: [
          {
            type: 'text',
            text: `Description de la carte mise à jour avec succès!\n\nID: ${card.id}\nNom: ${card.name}\nDescription: ${card.desc || '(vide)'}\nURL: ${card.url}`
          }
        ]
      };
    }

    if (name === 'archive_card') {
      const { cardId } = args as { cardId: string };

      // Validation cardId requis
      if (!cardId) {
        throw new Error('Le paramètre "cardId" est requis pour archiver une carte.');
      }

      // Validation format ID (24 caractères)
      if (cardId.length !== 24) {
        throw new Error(
          'L\'ID de carte doit être un ID complet (24 caractères), pas un short link.\n' +
          'Utilisez list_trello_cards pour obtenir l\'ID complet de la carte.'
        );
      }

      // Archivage via TrelloClient
      const card = await trelloClient.archiveCard(cardId);

      return {
        content: [
          {
            type: 'text',
            text: `Carte archivée avec succès! ✅\n\n` +
                  `ID: ${card.id}\n` +
                  `Nom: ${card.name}\n` +
                  `Statut: Archivée (closed=true)\n` +
                  `URL: ${card.url}\n\n` +
                  `💡 Astuce: Vous pouvez désarchiver cette carte plus tard si nécessaire.`
          }
        ]
      };
    }

    if (name === 'delete_card') {
      const { cardId } = args as { cardId: string };

      // Validation cardId requis
      if (!cardId) {
        throw new Error('Le paramètre "cardId" est requis pour supprimer une carte.');
      }

      // Validation format ID (24 caractères)
      if (cardId.length !== 24) {
        throw new Error(
          'L\'ID de carte doit être un ID complet (24 caractères), pas un short link.\n' +
          'Utilisez list_trello_cards pour obtenir l\'ID complet de la carte.'
        );
      }

      // Récupérer les infos de la carte avant suppression (pour confirmation)
      const card = await trelloClient.getCard(cardId);

      // Suppression permanente
      await trelloClient.deleteCard(cardId);

      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Carte SUPPRIMÉE DÉFINITIVEMENT\n\n` +
                  `ID supprimé: ${card.id}\n` +
                  `Nom supprimé: ${card.name}\n` +
                  `Description: ${card.desc || '(aucune)'}\n\n` +
                  `🚨 ATTENTION: Cette action est IRRÉVERSIBLE.\n` +
                  `La carte ne peut plus être récupérée.\n\n` +
                  `💡 Conseil: Pour les futures suppressions, utilisez d'abord archive_card.`
          }
        ]
      };
    }

    // ========== v1.4 - New Card Tools ==========

    if (name === 'unarchive_card') {
      const { cardId } = args as { cardId: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }

      const card = await trelloClient.unarchiveCard(cardId);

      return {
        content: [{
          type: 'text',
          text: `Carte désarchivée avec succès! ✅\n\n` +
                `ID: ${card.id}\n` +
                `Nom: ${card.name}\n` +
                `Statut: Réactivée (closed=false)\n` +
                `URL: ${card.url}`
        }]
      };
    }

    if (name === 'update_card_name') {
      const { cardId, name: newName } = args as { cardId: string; name: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }
      if (!newName || newName.trim().length === 0) {
        throw new Error('Le nouveau nom ne peut pas être vide');
      }

      const card = await trelloClient.updateCardName(cardId, newName.trim());

      return {
        content: [{
          type: 'text',
          text: `Nom de la carte mis à jour! ✅\n\n` +
                `Nouveau nom: ${card.name}\n` +
                `ID: ${card.id}\n` +
                `URL: ${card.url}`
        }]
      };
    }

    if (name === 'get_card_details') {
      const { cardId } = args as { cardId: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }

      const card = await trelloClient.getCardDetails(cardId);

      // Format detailed output
      let output = `📋 Détails de la carte\n\n`;
      output += `**Informations générales:**\n`;
      output += `- Nom: ${card.name}\n`;
      output += `- ID: ${card.id}\n`;
      output += `- Description: ${card.desc || '(aucune)'}\n`;
      output += `- Statut: ${card.closed ? 'Archivée ❌' : 'Active ✅'}\n`;
      output += `- URL: ${card.url}\n\n`;

      if (card.due) {
        output += `**📅 Date limite:**\n`;
        output += `- Due: ${new Date(card.due).toLocaleString('fr-FR')}\n`;
        output += `- Complété: ${card.dueComplete ? 'Oui ✅' : 'Non ⏳'}\n\n`;
      }

      if (card.labels && card.labels.length > 0) {
        output += `**🏷️ Labels:**\n`;
        card.labels.forEach(label => {
          output += `- ${label.name || label.color} (${label.color})\n`;
        });
        output += `\n`;
      }

      if (card.idMembers && card.idMembers.length > 0) {
        output += `**👥 Membres assignés:** ${card.idMembers.length}\n\n`;
      }

      if (card.checklists && card.checklists.length > 0) {
        output += `**☑️ Checklists:** ${card.checklists.length}\n`;
        card.checklists.forEach(checklist => {
          const completed = checklist.checkItems.filter(item => item.state === 'complete').length;
          output += `- ${checklist.name}: ${completed}/${checklist.checkItems.length} complétés\n`;
        });
        output += `\n`;
      }

      if (card.attachments && card.attachments.length > 0) {
        output += `**📎 Pièces jointes:** ${card.attachments.length}\n\n`;
      }

      return {
        content: [{ type: 'text', text: output }]
      };
    }

    // ========== v1.4 - Label Tools ==========

    if (name === 'list_labels') {
      const { boardId } = args as { boardId: string };

      if (!boardId || boardId.length !== 24) {
        throw new Error('ID de board invalide (24 caractères requis)');
      }

      const labels = await trelloClient.getLabels(boardId);

      if (labels.length === 0) {
        return {
          content: [{
            type: 'text',
            text: 'Aucun label trouvé sur ce board.'
          }]
        };
      }

      let output = `🏷️ Labels du board (${labels.length})\n\n`;
      labels.forEach(label => {
        output += `- ${label.name || '(sans nom)'} - ${label.color} (ID: ${label.id})\n`;
      });

      return {
        content: [{ type: 'text', text: output }]
      };
    }

    if (name === 'create_label') {
      const { boardId, name: labelName, color } = args as { boardId: string; name: string; color: string };

      if (!boardId || boardId.length !== 24) {
        throw new Error('ID de board invalide (24 caractères requis)');
      }
      if (!labelName || labelName.trim().length === 0) {
        throw new Error('Le nom du label ne peut pas être vide');
      }
      if (!color) {
        throw new Error('La couleur du label est requise');
      }

      const label = await trelloClient.createLabel(boardId, labelName.trim(), color);

      return {
        content: [{
          type: 'text',
          text: `Label créé avec succès! ✅\n\n` +
                `Nom: ${label.name}\n` +
                `Couleur: ${label.color}\n` +
                `ID: ${label.id}\n\n` +
                `💡 Utilisez add_label_to_card pour l'ajouter à une carte.`
        }]
      };
    }

    if (name === 'update_label') {
      const { labelId, name: newName, color: newColor } = args as { labelId: string; name?: string; color?: string };

      if (!labelId || labelId.length !== 24) {
        throw new Error('ID de label invalide (24 caractères requis)');
      }
      if (!newName && !newColor) {
        throw new Error('Au moins un paramètre (name ou color) doit être fourni');
      }

      const updates: { name?: string; color?: string } = {};
      if (newName) updates.name = newName.trim();
      if (newColor) updates.color = newColor;

      const label = await trelloClient.updateLabel(labelId, updates);

      return {
        content: [{
          type: 'text',
          text: `Label mis à jour! ✅\n\n` +
                `Nom: ${label.name}\n` +
                `Couleur: ${label.color}\n` +
                `ID: ${label.id}`
        }]
      };
    }

    if (name === 'add_label_to_card') {
      const { cardId, labelId } = args as { cardId: string; labelId: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }
      if (!labelId || labelId.length !== 24) {
        throw new Error('ID de label invalide (24 caractères requis)');
      }

      await trelloClient.addLabelToCard(cardId, labelId);

      return {
        content: [{
          type: 'text',
          text: `Label ajouté à la carte avec succès! ✅\n\n` +
                `Carte ID: ${cardId}\n` +
                `Label ID: ${labelId}`
        }]
      };
    }

    if (name === 'remove_label_from_card') {
      const { cardId, labelId } = args as { cardId: string; labelId: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }
      if (!labelId || labelId.length !== 24) {
        throw new Error('ID de label invalide (24 caractères requis)');
      }

      await trelloClient.removeLabelFromCard(cardId, labelId);

      return {
        content: [{
          type: 'text',
          text: `Label retiré de la carte avec succès! ✅\n\n` +
                `Carte ID: ${cardId}\n` +
                `Label ID: ${labelId}`
        }]
      };
    }

    // ========== v1.4 - Due Date Tools ==========

    if (name === 'set_card_due_date') {
      const { cardId, dueDate } = args as { cardId: string; dueDate: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }

      // Validate date format (ISO 8601)
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (!dateRegex.test(dueDate)) {
        throw new Error(
          'Format de date invalide. Utilisez le format ISO 8601:\n' +
          '"YYYY-MM-DDTHH:mm:ss.sssZ"\n' +
          'Exemple: "2025-12-31T23:59:59.999Z"'
        );
      }

      const card = await trelloClient.setCardDueDate(cardId, dueDate);

      return {
        content: [{
          type: 'text',
          text: `📅 Date limite définie!\n\n` +
                `Carte: ${card.name}\n` +
                `Due: ${new Date(card.due!).toLocaleString('fr-FR')}\n` +
                `URL: ${card.url}`
        }]
      };
    }

    if (name === 'remove_card_due_date') {
      const { cardId } = args as { cardId: string };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }

      const card = await trelloClient.removeCardDueDate(cardId);

      return {
        content: [{
          type: 'text',
          text: `📅 Date limite retirée!\n\n` +
                `Carte: ${card.name}\n` +
                `URL: ${card.url}`
        }]
      };
    }

    if (name === 'mark_due_date_complete') {
      const { cardId, complete } = args as { cardId: string; complete?: boolean };

      if (!cardId || cardId.length !== 24) {
        throw new Error('ID de carte invalide (24 caractères requis)');
      }

      const isComplete = complete !== undefined ? complete : true;
      const card = await trelloClient.markDueDateComplete(cardId, isComplete);

      return {
        content: [{
          type: 'text',
          text: `📅 Statut de la date limite mis à jour!\n\n` +
                `Carte: ${card.name}\n` +
                `Complété: ${isComplete ? 'Oui ✅' : 'Non ⏳'}\n` +
                `URL: ${card.url}`
        }]
      };
    }

    if (name === 'list_cards_by_due_date') {
      const { boardId } = args as { boardId: string };

      if (!boardId || boardId.length !== 24) {
        throw new Error('ID de board invalide (24 caractères requis)');
      }

      const cards = await trelloClient.getCardsByDueDate(boardId);

      if (cards.length === 0) {
        return {
          content: [{
            type: 'text',
            text: 'Aucune carte avec date limite trouvée sur ce board.'
          }]
        };
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

      return {
        content: [{ type: 'text', text: output }]
      };
    }

    throw new Error(`Outil inconnu: ${name}`);

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ Trello MCP Server v1.4.0 démarré avec succès');
  console.error('📋 24 outils disponibles: boards (2), lists (2), cards (11), labels (5), dates (4)');
  console.error('🔐 Authentifié avec l\'API Trello');
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
