/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { InventoryTsvbType } from '@kbn/metrics-data-access-plugin/common';
import { metrics } from '@kbn/metrics-data-access-plugin/common';
import type { InfraMetadataFeature } from '../../../../../common/http_api/metadata_api';
import { TIMESTAMP_FIELD } from '../../../../../common/constants';

export const getFilteredMetrics = (
  requiredTsvb: InventoryTsvbType[],
  metadata: Array<InfraMetadataFeature | null | undefined>
) => {
  const metricMetadata = metadata
    .filter((data) => data && data.source === 'metrics')
    .map((data) => data && data.name);
  return requiredTsvb.filter((metric) => {
    const metricModelCreator = metrics?.tsvb[metric] ?? null;

    // We just need to get a dummy version of the model so we can filter
    // using the `requires` attribute.
    const metricModel = metricModelCreator
      ? metricModelCreator(TIMESTAMP_FIELD, 'test', '>=1m')
      : { requires: [''] }; // when tsvb is not defined (host & container)
    return metricMetadata.some((m) => m && metricModel?.requires?.includes(m));
  });
};
