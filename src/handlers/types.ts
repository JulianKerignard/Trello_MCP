/**
 * Handler Types and Interfaces for Trello MCP Server
 * Defines contracts for tool handlers following Factory + Registry pattern
 */

/**
 * Tool categories for organization
 */
export type ToolCategory =
  | 'boards'
  | 'lists'
  | 'cards'
  | 'labels'
  | 'dates'
  | 'checklists'
  | 'members'
  | 'attachments'
  | 'bulk';

/**
 * Standard MCP tool result format
 * Matches CallToolResult from @modelcontextprotocol/sdk
 */
export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  _meta?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Validation rule for parameters
 */
export interface ValidationRule {
  param: string;
  required: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  length?: number; // For ID validation (24 chars)
  minLength?: number;
  pattern?: RegExp;
  enum?: string[];
}

/**
 * Tool configuration metadata
 */
export interface ToolConfig {
  name: string;
  category: ToolCategory;
  description: string;
  validation?: ValidationRule[];
}

/**
 * Base interface for all tool handlers
 */
export interface ToolHandler<TArgs = any, _TResult = any> {
  /**
   * Execute the tool handler logic
   * @param args - Tool arguments (validated by caller)
   * @returns Promise resolving to MCP tool result
   */
  execute(args: TArgs): Promise<ToolResult>;

  /**
   * Get tool configuration
   */
  getConfig(): ToolConfig;
}

/**
 * Tool definition for MCP SDK (ListToolsRequestSchema)
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Formatter function type for converting results to text
 */
export type ResultFormatter<T = any> = (result: T) => string;

/**
 * Common validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly param: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Tool not found error
 */
export class ToolNotFoundError extends Error {
  constructor(public readonly toolName: string) {
    super(`Outil inconnu: ${toolName}`);
    this.name = 'ToolNotFoundError';
  }
}
