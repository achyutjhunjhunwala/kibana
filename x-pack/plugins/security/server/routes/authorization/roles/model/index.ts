/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export type { RolePayloadSchemaType } from './put_payload';
export { transformPutPayloadToElasticsearchRole, getPutPayloadSchema } from './put_payload';

export { getBulkCreateOrUpdatePayloadSchema } from './bulk_create_or_update_payload';
export type { BulkCreateOrUpdateRolesPayloadSchemaType } from './bulk_create_or_update_payload';
