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

const getCodeByPathSchema = z.object({
  filePath: z
    .string()
    .describe(
      'The relative file path in the Kibana repository (e.g., "src/core/server/http/router.ts")'
    ),
  startLine: z
    .number()
    .optional()
    .describe('(optional) Starting line number to retrieve code from'),
  endLine: z.number().optional().describe('(optional) Ending line number to retrieve code up to'),
});

export const getCodeByPathTool = (): BuiltinToolDefinition<typeof getCodeByPathSchema> => {
  return {
    id: platformCoreTools.getCodeByPath,
    type: ToolType.builtin,
    description: `Retrieve code from a specific file path in the Kibana repository.
This tool is ideal when you have an exact file path, such as from a stack trace or error log.

Use this tool when:
- You have a file path from a stack trace or error message
- You need to see the code at a specific location
- You want to examine code around certain line numbers
- You're following up on a previous search result

Examples:
- "Show me the code in src/core/server/http/router.ts"
- "Get the code from x-pack/plugins/security/server/authentication/authenticator.ts lines 150-200"
- "Retrieve the handler function at packages/kbn-optimizer/src/worker/run_compilers.ts"

The tool returns:
- All code chunks from the specified file
- Optionally filtered by line range if startLine/endLine provided
- File metadata and function/class information`,
    schema: getCodeByPathSchema,
    handler: async ({ filePath, startLine, endLine }, { esClient, logger }) => {
      logger.debug(
        `get_code_by_path called with filePath: ${filePath}, startLine: ${startLine}, endLine: ${endLine}`
      );

      const INDEX_NAME = 'kibana-code-chunks';

      try {
        // Build the query
        const must: any[] = [{ term: { filePath } }];

        // Add line range filter if provided
        if (startLine !== undefined || endLine !== undefined) {
          const rangeFilter: any = {};
          if (startLine !== undefined) {
            rangeFilter.gte = startLine;
          }
          if (endLine !== undefined) {
            rangeFilter.lte = endLine;
          }
          must.push({ range: { startLine: rangeFilter } });
        }

        // Execute search
        const response = await esClient.asCurrentUser.search({
          index: INDEX_NAME,
          size: 50,
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
          sort: [{ startLine: { order: 'asc' } }],
        });

        const hits = response.hits.hits;

        if (hits.length === 0) {
          return {
            results: [
              {
                type: ToolResultType.other,
                data: {
                  message: `No code found at file path: ${filePath}`,
                  suggestions: [
                    'Check if the file path is correct',
                    'The file may not be indexed yet (indexing in progress)',
                    'Try searching without line numbers first',
                  ],
                  filePath,
                  startLine,
                  endLine,
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
          };
        });

        return {
          results: [
            {
              tool_result_id: getToolResultId(),
              type: ToolResultType.other,
              data: {
                filePath,
                requestedRange: startLine || endLine ? { startLine, endLine } : 'entire file',
                totalChunks: hits.length,
                results: codeResults,
                note: 'Code chunks are ordered by line number (ascending). Each chunk represents a function, class, or code block.',
              },
            },
          ],
        };
      } catch (error) {
        logger.error(`get_code_by_path error: ${error}`);
        return {
          results: [
            {
              type: ToolResultType.error,
              data: {
                message: `Failed to retrieve code: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
                details: {
                  filePath,
                  startLine,
                  endLine,
                },
              },
            },
          ],
        };
      }
    },
    tags: ['code-search', 'file-lookup'],
  };
};
