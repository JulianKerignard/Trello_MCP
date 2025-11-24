/**
 * Base Tool Handler
 * Abstract class providing common validation, error handling, and formatting logic
 */

import { TrelloClient } from '../trello-client.js';
import { ToolHandler, ToolConfig, ToolResult, ValidationRule, ValidationError } from './types.js';
import { createChildLogger } from '../logger.js';

const logger = createChildLogger({ module: 'BaseToolHandler' });

/**
 * Abstract base class for all tool handlers
 * Provides centralized validation, error handling, and response formatting
 */
export abstract class BaseToolHandler<TArgs = any, TResult = any>
  implements ToolHandler<TArgs, TResult>
{
  constructor(
    protected readonly trelloClient: TrelloClient,
    protected readonly config: ToolConfig
  ) {}

  /**
   * Execute the tool handler (must be implemented by subclasses)
   */
  abstract execute(args: TArgs): Promise<ToolResult>;

  /**
   * Get tool configuration
   */
  getConfig(): ToolConfig {
    return this.config;
  }

  /**
   * Validate arguments against validation rules
   * Throws ValidationError if validation fails
   */
  protected validate(args: any): void {
    if (!this.config.validation) return;

    for (const rule of this.config.validation) {
      const value = args[rule.param];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        throw new ValidationError(`Le paramètre "${rule.param}" est requis.`, rule.param);
      }

      // Skip further validation if not required and missing
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Check type
      if (rule.type) {
        if (rule.type === 'array' && !Array.isArray(value)) {
          throw new ValidationError(
            `Le paramètre "${rule.param}" doit être de type array.`,
            rule.param
          );
        } else if (rule.type !== 'array' && typeof value !== rule.type) {
          throw new ValidationError(
            `Le paramètre "${rule.param}" doit être de type ${rule.type}.`,
            rule.param
          );
        }
      }

      // Check exact length (for IDs)
      if (rule.length !== undefined && value.length !== rule.length) {
        throw new ValidationError(
          `Le paramètre "${rule.param}" doit avoir exactement ${rule.length} caractères.`,
          rule.param
        );
      }

      // Check min length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        throw new ValidationError(
          `Le paramètre "${rule.param}" doit avoir au moins ${rule.minLength} caractères.`,
          rule.param
        );
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new ValidationError(`Le paramètre "${rule.param}" a un format invalide.`, rule.param);
      }

      // Check enum
      if (rule.enum && !rule.enum.includes(value)) {
        throw new ValidationError(
          `Le paramètre "${rule.param}" doit être l'une des valeurs: ${rule.enum.join(', ')}.`,
          rule.param
        );
      }
    }
  }

  /**
   * Format response as MCP ToolResult
   */
  protected formatResponse(text: string, isError: boolean = false): ToolResult {
    logger.debug(
      {
        tool: this.config.name,
        category: this.config.category,
        isError
      },
      'Formatting tool response'
    );

    return {
      content: [
        {
          type: 'text',
          text
        }
      ],
      isError
    };
  }

  /**
   * Format JSON response (pretty-printed)
   */
  protected formatJSON(data: any): ToolResult {
    return this.formatResponse(JSON.stringify(data, null, 2));
  }

  /**
   * Handle errors and return formatted error response
   */
  protected handleError(error: any): ToolResult {
    if (error instanceof ValidationError) {
      logger.warn(
        {
          tool: this.config.name,
          param: error.param,
          message: error.message
        },
        'Validation error'
      );
      return this.formatResponse(error.message, true);
    }

    logger.error(
      {
        tool: this.config.name,
        error: {
          message: error.message,
          stack: error.stack
        }
      },
      'Tool execution error'
    );

    return this.formatResponse(`Erreur: ${error.message}`, true);
  }
}
