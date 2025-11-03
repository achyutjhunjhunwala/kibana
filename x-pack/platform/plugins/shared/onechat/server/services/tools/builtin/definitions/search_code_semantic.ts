/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from '@kbn/zod';
import { platformCoreTools, ToolType } from '@kbn/onechat-common';
import { ToolResultType } from '@kbn/onechat-common/tools/tool_result';
import type { BuiltinToolDefinition } from '@kbn/onechat-server';
import { getToolResultId } from '@kbn/onechat-server/tools';

const searchCodeSemanticSchema = z.object({
  query: z
    .string()
    .describe(
      'A natural language query describing the code you want to find (e.g., "authentication logic", "error handling for API requests")'
    ),
  language: z
    .string()
    .optional()
    .describe(
      '(optional) Filter by programming language: typescript, javascript, python, java, go, yaml, markdown, json'
    ),
  filePathPattern: z
    .string()
    .optional()
    .describe(
      '(optional) Filter by file path pattern (e.g., "discover", "x-pack/plugins/security")'
    ),
});

export const searchCodeSemanticTool = (): BuiltinToolDefinition<
  typeof searchCodeSemanticSchema
> => {
  return {
    id: platformCoreTools.searchCodeSemantic,
    type: ToolType.builtin,
    description: `Search the Kibana source code repository using natural language queries.
This tool uses semantic search to find relevant code snippets based on meaning and intent,
not just keyword matching.

Use this tool when:
- Looking for code that implements specific functionality
- Finding examples of how a feature is implemented
- Discovering code related to error messages or log patterns
- Exploring unfamiliar parts of the codebase

Examples:
- "Find authentication and authorization logic"
- "Show me how data is fetched from Elasticsearch"
- "Find error handling for network failures"
- "Locate the code that generates audit logs"

The tool returns code chunks with:
- File paths and line numbers
- Function/class names
- The actual code content
- Language and code type (function, class, interface, etc.)`,
    schema: searchCodeSemanticSchema,
    handler: async ({ query, language, filePathPattern }, { esClient, logger }) => {
      logger.debug(
        `search_code_semantic called with query: ${query}, language: ${language}, filePathPattern: ${filePathPattern}`
      );

      const INDEX_NAME = 'kibana-code-chunks';

      try {
        // Build the query
        const must: any[] = [
          {
            text_expansion: {
              semantic_text: {
                model_id: '.elser-2-elastic',
                model_text: query,
              },
            },
          },
        ];

        // Add optional filters
        if (language) {
          must.push({ term: { language: language.toLowerCase() } });
        }

        if (filePathPattern) {
          must.push({
            wildcard: { filePath: `*${filePathPattern}*` },
          });
        }

        // Execute semantic search
        const response = await esClient.asCurrentUser.search({
          index: INDEX_NAME,
          size: 10,
          _source: [
            'content',
            'filePath',
            'startLine',
            'endLine',
            'language',
            'kind',
            'symbols',
            'containerPath',
          ],
          query: {
            bool: {
              must,
            },
          },
          sort: [{ _score: { order: 'desc' } }],
        });

        const hits = response.hits.hits;

        if (hits.length === 0) {
          return {
            results: [
              {
                type: ToolResultType.other,
                data: {
                  message: 'No code found matching your query.',
                  query,
                  suggestions: [
                    'Try broader search terms',
                    'Remove language or path filters',
                    'Check if the code area exists in Kibana repository',
                  ],
                },
              },
            ],
          };
        }

        // Format results
        const codeResults = hits.map((hit: any) => {
          const source = hit._source;
          const symbolNames = source.symbols?.map((s: any) => s.name).join(', ') || 'N/A';

          return {
            file: source.filePath,
            lines: `${source.startLine}-${source.endLine}`,
            language: source.language,
            type: source.kind || 'code',
            container: source.containerPath || 'N/A',
            symbols: symbolNames,
            content: source.content,
            relevance: hit._score?.toFixed(2),
          };
        });

        return {
          results: [
            {
              tool_result_id: getToolResultId(),
              type: ToolResultType.other,
              data: {
                query,
                totalResults: hits.length,
                results: codeResults,
                note: 'Results are ordered by relevance. Each result includes file path, line numbers, and code content.',
              },
            },
          ],
        };
      } catch (error) {
        logger.error(`search_code_semantic error: ${error}`);
        return {
          results: [
            {
              type: ToolResultType.error,
              data: {
                message: `Failed to search code: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
                details: {
                  query,
                  language,
                  filePathPattern,
                },
              },
            },
          ],
        };
      }
    },
    tags: ['code-search', 'semantic'],
  };
};
