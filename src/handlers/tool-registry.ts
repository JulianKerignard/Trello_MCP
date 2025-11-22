/**
 * Tool Registry
 * Central registry for managing and executing MCP tool handlers
 */

import { ToolHandler, Tool, ToolResult, ToolNotFoundError } from './types.js';
import { createChildLogger } from '../logger.js';

const logger = createChildLogger({ module: 'ToolRegistry' });

/**
 * Registry for MCP tool handlers
 * Provides centralized tool management, discovery, and execution
 */
export class ToolRegistry {
  private handlers = new Map<string, ToolHandler>();

  /**
   * Register a tool handler
   * @param name - Tool name (unique identifier)
   * @param handler - Tool handler instance
   */
  register(name: string, handler: ToolHandler): void {
    if (this.handlers.has(name)) {
      logger.warn({ tool: name }, 'Tool already registered, overwriting');
    }

    this.handlers.set(name, handler);
    logger.debug(
      {
        tool: name,
        category: handler.getConfig().category,
        totalTools: this.handlers.size
      },
      'Tool registered'
    );
  }

  /**
   * Execute a tool by name
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Promise resolving to tool result
   * @throws ToolNotFoundError if tool not registered
   */
  async execute(name: string, args: any): Promise<ToolResult> {
    const handler = this.handlers.get(name);

    if (!handler) {
      logger.error({ tool: name, availableTools: this.getToolNames() }, 'Tool not found');
      throw new ToolNotFoundError(name);
    }

    logger.info({ tool: name, category: handler.getConfig().category }, 'Executing tool');

    try {
      const result = await handler.execute(args);
      logger.info({ tool: name, success: !result.isError }, 'Tool executed');
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
        'Tool execution failed'
      );

      // Return error response
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
  }

  /**
   * Get all tool definitions for MCP SDK
   * Automatically generates tool definitions from registered handlers
   */
  getToolDefinitions(): Tool[] {
    const tools: Tool[] = [];

    for (const [name, handler] of this.handlers.entries()) {
      const config = handler.getConfig();

      // Build inputSchema from validation rules
      const properties: Record<string, any> = {};
      const required: string[] = [];

      if (config.validation) {
        for (const rule of config.validation) {
          properties[rule.param] = {
            type: rule.type || 'string',
            description: `Parameter ${rule.param}`
          };

          if (rule.length) {
            properties[rule.param].description += ` (${rule.length} characters)`;
          }

          if (rule.enum) {
            properties[rule.param].enum = rule.enum;
          }

          if (rule.required) {
            required.push(rule.param);
          }
        }
      }

      tools.push({
        name,
        description: config.description,
        inputSchema: {
          type: 'object',
          properties,
          required
        }
      });
    }

    logger.debug({ toolCount: tools.length }, 'Generated tool definitions');
    return tools;
  }

  /**
   * Get list of registered tool names
   */
  getToolNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get number of registered tools
   */
  getToolCount(): number {
    return this.handlers.size;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): string[] {
    const tools: string[] = [];

    for (const [name, handler] of this.handlers.entries()) {
      if (handler.getConfig().category === category) {
        tools.push(name);
      }
    }

    return tools;
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.handlers.has(name);
  }

  /**
   * Clear all registered tools (for testing)
   */
  clear(): void {
    const count = this.handlers.size;
    this.handlers.clear();
    logger.info({ toolsCleared: count }, 'Registry cleared');
  }
}
