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

  console.error('✅ Trello MCP Server v1.0.0 démarré avec succès');
  console.error('📋 12 outils disponibles: boards (2), lists (2), cards (8)');
  console.error('🔐 Authentifié avec l\'API Trello');
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
