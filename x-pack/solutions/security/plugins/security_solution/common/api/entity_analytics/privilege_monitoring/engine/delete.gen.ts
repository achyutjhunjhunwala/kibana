/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Delete Privilege Monitoring Engine
 *   version: 2023-10-31
 */

import { z } from '@kbn/zod';
import { BooleanFromString } from '@kbn/zod-helpers';

export type DeleteMonitoringEngineRequestQuery = z.infer<typeof DeleteMonitoringEngineRequestQuery>;
export const DeleteMonitoringEngineRequestQuery = z.object({
  /**
   * Whether to delete all the privileged user data
   */
  data: BooleanFromString.optional().default(false),
});
export type DeleteMonitoringEngineRequestQueryInput = z.input<
  typeof DeleteMonitoringEngineRequestQuery
>;

export type DeleteMonitoringEngineResponse = z.infer<typeof DeleteMonitoringEngineResponse>;
export const DeleteMonitoringEngineResponse = z.object({
  deleted: z.boolean(),
});
