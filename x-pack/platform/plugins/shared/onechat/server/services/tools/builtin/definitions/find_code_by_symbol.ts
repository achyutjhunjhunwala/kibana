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

const findCodeBySymbolSchema = z.object({
  symbolName: z
    .string()
    .describe(
      'The name of the function, class, interface, or variable to search for (e.g., "authenticate", "HttpService", "DiscoveryPlugin")'
    ),
  symbolType: z
    .string()
    .optional()
    .describe('(optional) The type of symbol: function, class, interface, method, variable, type'),
});

export const findCodeBySymbolTool = (): BuiltinToolDefinition<typeof findCodeBySymbolSchema> => {
  return {
    id: platformCoreTools.findCodeBySymbol,
    type: ToolType.builtin,
    description: `Find code by searching for specific function, class, interface, or variable names.
This tool searches through the extracted symbols in the indexed code to locate definitions
and usages of named entities.

Use this tool when:
- You know the name of a function or class mentioned in a log or error
- You want to find where a specific API or method is defined
- You're tracking down the implementation of a named component
- You need to understand how a particular symbol is used

Examples:
- "Find the authenticate function"
- "Locate the HttpService class"
- "Show me where DiscoveryPlugin is defined"
- "Find all code containing the handleRequest method"

The tool returns:
- All code chunks containing the specified symbol
- File paths and line numbers for each occurrence
- Context about whether it's a definition or usage`,
    schema: findCodeBySymbolSchema,
    handler: async ({ symbolName, symbolType }, { esClient, logger }) => {
      logger.debug(
        `find_code_by_symbol called with symbolName: ${symbolName}, symbolType: ${symbolType}`
      );

      const INDEX_NAME = 'kibana-code-chunks';

      try {
        // Build nested query for symbols array
        const must: any[] = [
          {
            nested: {
              path: 'symbols',
              query: {
                bool: {
                  must: [{ term: { 'symbols.name': symbolName } }],
                },
              },
            },
          },
        ];

        // Add symbol type filter if provided
        if (symbolType) {
          must.push({
            nested: {
              path: 'symbols',
              query: {
                bool: {
                  must: [{ term: { 'symbols.kind': symbolType.toLowerCase() } }],
                },
              },
            },
          });
        }

        // Execute search
        const response = await esClient.asCurrentUser.search({
          index: INDEX_NAME,
          size: 20,
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
          sort: [{ filePath: { order: 'asc' } }, { startLine: { order: 'asc' } }],
        });

        const hits = response.hits.hits;

        if (hits.length === 0) {
          return {
            results: [
              {
                type: ToolResultType.other,
                data: {
                  message: `No code found containing symbol: ${symbolName}`,
                  suggestions: [
                    'Check if the symbol name is spelled correctly',
                    'Try without specifying the symbol type',
                    'The code may not be indexed yet (indexing in progress)',
                    'Try using search_code_semantic for broader results',
                  ],
                  symbolName,
                  symbolType,
                },
              },
            ],
          };
        }

        // Format results
        const codeResults = hits.map((hit: any) => {
          const source = hit._source;

          // Find matching symbols
          const matchingSymbols = source.symbols?.filter((s: any) => s.name === symbolName) || [];

          const symbolInfo = matchingSymbols.map((s: any) => ({
            name: s.name,
            kind: s.kind,
            line: s.line,
          }));

          return {
            file: source.filePath,
            lines: `${source.startLine}-${source.endLine}`,
            language: source.language,
            chunkType: source.kind || 'code',
            container: source.containerPath || 'N/A',
            matchingSymbols: symbolInfo,
            content: source.content,
          };
        });

        return {
          results: [
            {
              tool_result_id: getToolResultId(),
              type: ToolResultType.other,
              data: {
                symbolName,
                symbolType: symbolType || 'any',
                totalOccurrences: hits.length,
                results: codeResults,
                note: `Found ${hits.length} code chunks containing the symbol "${symbolName}". Results are grouped by file and ordered by line number.`,
              },
            },
          ],
        };
      } catch (error) {
        logger.error(`find_code_by_symbol error: ${error}`);
        return {
          results: [
            {
              type: ToolResultType.error,
              data: {
                message: `Failed to find symbol: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
                details: {
                  symbolName,
                  symbolType,
                },
              },
            },
          ],
        };
      }
    },
    tags: ['code-search', 'symbol-lookup'],
  };
};
