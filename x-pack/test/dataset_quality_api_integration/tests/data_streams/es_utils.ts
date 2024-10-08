/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Client } from '@elastic/elasticsearch';
import { IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export async function addIntegrationToLogIndexTemplate({
  esClient,
  name,
  managedBy = 'fleet',
}: {
  esClient: Client;
  name: string;
  managedBy?: string;
}) {
  const { index_templates: indexTemplates } = await esClient.indices.getIndexTemplate({
    name: 'logs',
  });

  await esClient.indices.putIndexTemplate({
    name: 'logs',
    body: {
      ...indexTemplates[0].index_template,
      _meta: {
        ...indexTemplates[0].index_template._meta,
        package: {
          name,
        },
        managed_by: managedBy,
      },
    },
  });
}

export async function cleanLogIndexTemplate({ esClient }: { esClient: Client }) {
  const { index_templates: indexTemplates } = await esClient.indices.getIndexTemplate({
    name: 'logs',
  });

  await esClient.indices.putIndexTemplate({
    name: 'logs',
    body: {
      ...indexTemplates[0].index_template,
      _meta: {
        ...indexTemplates[0].index_template._meta,
        package: undefined,
        managed_by: undefined,
      },
    },
  });
}

function getCurrentDateFormatted() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function createBackingIndexNameWithoutVersion({
  type,
  dataset,
  namespace = 'default',
}: {
  type: string;
  dataset: string;
  namespace: string;
}) {
  return `.ds-${type}-${dataset}-${namespace}-${getCurrentDateFormatted()}`;
}

export async function setDataStreamSettings(
  esClient: Client,
  name: string,
  settings: IndicesIndexSettings
) {
  return esClient.indices.putSettings({
    index: name,
    settings,
  });
}
