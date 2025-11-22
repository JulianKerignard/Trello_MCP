#!/usr/bin/env node

/**
 * Trello MCP Server v2.0.0
 * Model Context Protocol server for Trello API integration
 * Refactored architecture with handler registry pattern
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { TrelloClient } from './trello-client.js';
import logger from './logger.js';
import { ToolRegistry } from './handlers/tool-registry.js';
import { registerAllHandlers } from './handlers/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const apiKey = process.env.TRELLO_API_KEY;
const apiToken = process.env.TRELLO_API_TOKEN;

if (!apiKey || !apiToken) {
  logger.fatal('Missing Trello API credentials');
  logger.error("❌ ERREUR: Variables d'environnement manquantes");
  logger.error('');
  logger.error('TRELLO_API_KEY et TRELLO_API_TOKEN doivent être définis.');
  logger.error('');
  logger.error('Pour obtenir vos credentials:');
  logger.error('1. Visitez https://trello.com/power-ups/admin');
  logger.error('2. Créez un Power-Up (si nécessaire)');
  logger.error('3. Générez une API Key');
  logger.error('4. Générez un Token avec les permissions read et write');
  logger.error('');
  logger.error('Puis configurez votre fichier .env ou Claude Desktop config.');
  process.exit(1);
}

// Create Trello client
let trelloClient: TrelloClient;
try {
  trelloClient = new TrelloClient(apiKey, apiToken);
} catch (error: any) {
  logger.fatal({ error: error.message }, 'Failed to initialize Trello client');
  logger.error("❌ ERREUR lors de l'initialisation du client Trello:");
  logger.error(error.message);
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'trello-mcp-server',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Create and initialize tool registry
const registry = new ToolRegistry();
registerAllHandlers(registry, trelloClient);

logger.info(
  {
    toolsRegistered: registry.getToolCount(),
    categories: ['boards', 'lists', 'cards', 'labels', 'dates', 'checklists', 'members'].map(
      (cat) => ({
        category: cat,
        count: registry.getToolsByCategory(cat).length
      })
    )
  },
  'Tool registry initialized'
);

/**
 * Handler for listing available tools
 * Automatically generates tool definitions from registered handlers
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = registry.getToolDefinitions();
  logger.debug({ toolCount: tools.length }, 'Listed tools');
  return { tools };
});

/**
 * Handler for calling tools
 * Dispatches tool execution to registered handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info({ tool: name }, 'Tool call received');

  try {
    const result = await registry.execute(name, args);
    return result;
  } catch (error: any) {
    logger.error(
      {
        tool: name,
        error: {
          message: error.message,
          type: error.name
        }
      },
      'Tool execution error'
    );

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

  const toolStats = {
    boards: registry.getToolsByCategory('boards').length,
    lists: registry.getToolsByCategory('lists').length,
    cards: registry.getToolsByCategory('cards').length,
    labels: registry.getToolsByCategory('labels').length,
    dates: registry.getToolsByCategory('dates').length,
    checklists: registry.getToolsByCategory('checklists').length,
    members: registry.getToolsByCategory('members').length
  };

  logger.info(
    {
      version: '2.0.0',
      tools: registry.getToolCount(),
      categories: toolStats,
      architecture: 'handler-registry-pattern'
    },
    'Trello MCP Server started successfully'
  );

  logger.error('✅ Trello MCP Server v2.0.0 démarré avec succès');
  logger.error(
    `📋 ${registry.getToolCount()} outils disponibles: ` +
      `boards (${toolStats.boards}), ` +
      `lists (${toolStats.lists}), ` +
      `cards (${toolStats.cards}), ` +
      `labels (${toolStats.labels}), ` +
      `dates (${toolStats.dates}), ` +
      `checklists (${toolStats.checklists}), ` +
      `members (${toolStats.members})`
  );
  logger.error("🔐 Authentifié avec l'API Trello");
  logger.error('🏗️ Architecture: Handler Registry Pattern');
}

main().catch((error) => {
  logger.fatal({ error }, 'Fatal error occurred');
  logger.error('❌ Erreur fatale:', error);
  process.exit(1);
});
