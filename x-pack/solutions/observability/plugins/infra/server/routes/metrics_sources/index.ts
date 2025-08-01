/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import Boom from '@hapi/boom';
import { createRouteValidationFunction } from '@kbn/io-ts-utils';
import { kqlQuery, rangeQuery, termQuery, termsQuery } from '@kbn/observability-plugin/server';
import { DataSchemaFormat } from '@kbn/metrics-data-access-plugin/common';
import { DATASTREAM_DATASET, EVENT_MODULE, METRICSET_MODULE } from '../../../common/constants';
import {
  getHasDataQueryParamsRT,
  getHasDataResponseRT,
  getTimeRangeMetadataQueryParamsRT,
  getTimeRangeMetadataResponseRT,
} from '../../../common/metrics_sources/get_has_data';
import type { InfraBackendLibs } from '../../lib/infra_types';
import { hasData } from '../../lib/sources/has_data';
import { createSearchClient } from '../../lib/create_search_client';
import { AnomalyThresholdRangeError, NoSuchRemoteClusterError } from '../../lib/sources/errors';
import type { MetricsSourceStatus } from '../../../common/metrics_sources';
import {
  metricsSourceConfigurationResponseRT,
  partialMetricsSourceConfigurationReqPayloadRT,
} from '../../../common/metrics_sources';
import type { InfraSource } from '../../lib/sources';
import type { InfraPluginRequestHandlerContext } from '../../types';
import { getInfraMetricsClient } from '../../lib/helpers/get_infra_metrics_client';
import { integrationNameByEntityType } from '../../lib/sources/constants';

const defaultStatus = {
  metricIndicesExist: false,
  remoteClustersExist: false,
};

export const initMetricsSourceConfigurationRoutes = (libs: InfraBackendLibs) => {
  const { framework, logger } = libs;

  const composeSourceStatus = async (
    requestContext: InfraPluginRequestHandlerContext,
    sourceId: string
  ): Promise<MetricsSourceStatus> => {
    try {
      const hasMetricIndices = await libs.sourceStatus.hasMetricIndices(requestContext, sourceId);
      return {
        metricIndicesExist: hasMetricIndices,
        remoteClustersExist: true,
      };
    } catch (err) {
      logger.error(err);

      if (err instanceof NoSuchRemoteClusterError) {
        return defaultStatus;
      }

      return {
        metricIndicesExist: false,
        remoteClustersExist: true,
      };
    }
  };

  framework.registerRoute(
    {
      method: 'get',
      path: '/api/metrics/source/{sourceId}',
      validate: {
        params: schema.object({
          sourceId: schema.string(),
        }),
      },
    },
    async (requestContext, request, response) => {
      const { sourceId } = request.params;
      const soClient = (await requestContext.core).savedObjects.client;

      try {
        const [sourceSettled, statusSettled] = await Promise.allSettled([
          libs.sources.getSourceConfiguration(soClient, sourceId),
          composeSourceStatus(requestContext, sourceId),
        ]);

        const source = isFulfilled<InfraSource>(sourceSettled) ? sourceSettled.value : null;
        const status = isFulfilled<MetricsSourceStatus>(statusSettled)
          ? statusSettled.value
          : defaultStatus;

        if (!source) {
          return response.notFound();
        }

        const sourceResponse = {
          source: { ...source, status },
        };

        return response.ok({
          body: metricsSourceConfigurationResponseRT.encode(sourceResponse),
        });
      } catch (error) {
        return response.customError({
          statusCode: error.statusCode ?? 500,
          body: {
            message: error.message ?? 'An unexpected error occurred',
          },
        });
      }
    }
  );

  framework.registerRoute(
    {
      method: 'patch',
      path: '/api/metrics/source/{sourceId}',
      validate: {
        params: schema.object({
          sourceId: schema.string(),
        }),
        body: createRouteValidationFunction(partialMetricsSourceConfigurationReqPayloadRT),
      },
    },
    framework.router.handleLegacyErrors(async (requestContext, request, response) => {
      const { sources } = libs;
      const { sourceId } = request.params;
      const sourceConfigurationPayload = request.body;

      try {
        const soClient = (await requestContext.core).savedObjects.client;
        const sourceConfiguration = await sources.getSourceConfiguration(soClient, sourceId);

        if (sourceConfiguration.origin === 'internal') {
          response.conflict({
            body: 'A conflicting read-only source configuration already exists.',
          });
        }

        const sourceConfigurationExists = sourceConfiguration.origin === 'stored';
        const patchedSourceConfiguration = await (sourceConfigurationExists
          ? sources.updateSourceConfiguration(soClient, sourceId, sourceConfigurationPayload)
          : sources.createSourceConfiguration(soClient, sourceId, sourceConfigurationPayload));

        const status = await composeSourceStatus(requestContext, sourceId);

        const sourceResponse = {
          source: { ...patchedSourceConfiguration, status },
        };

        return response.ok({
          body: metricsSourceConfigurationResponseRT.encode(sourceResponse),
        });
      } catch (error) {
        if (Boom.isBoom(error)) {
          throw error;
        }

        if (error instanceof AnomalyThresholdRangeError) {
          return response.customError({
            statusCode: 400,
            body: {
              message: error.message,
            },
          });
        }

        return response.customError({
          statusCode: error.statusCode ?? 500,
          body: {
            message: error.message ?? 'An unexpected error occurred',
          },
        });
      }
    })
  );

  framework.registerRoute(
    {
      method: 'get',
      path: '/api/metrics/source/{sourceId}/hasData',
      validate: {
        params: schema.object({
          sourceId: schema.string(),
        }),
      },
    },
    async (requestContext, request, response) => {
      const { sourceId } = request.params;

      const client = createSearchClient(requestContext, framework);
      const soClient = (await requestContext.core).savedObjects.client;
      const source = await libs.sources.getSourceConfiguration(soClient, sourceId);

      const results = await hasData(source.configuration.metricAlias, client);

      return response.ok({
        body: { hasData: results, configuration: source.configuration },
      });
    }
  );

  framework.registerRoute(
    {
      method: 'get',
      path: '/api/metrics/source/hasData',
      validate: {
        query: createRouteValidationFunction(getHasDataQueryParamsRT),
      },
    },
    async (context, request, response) => {
      try {
        const { entityType: integration } = request.query;

        const infraMetricsClient = await getInfraMetricsClient({
          request,
          libs,
          context,
        });

        const source = integration ? integrationNameByEntityType[integration] : undefined;

        const hasDataResponse = await infraMetricsClient.search({
          track_total_hits: true,
          terminate_after: 1,
          size: 0,
          query: {
            bool: {
              should: source
                ? [
                    ...termQuery(EVENT_MODULE, source.beats),
                    ...termQuery(METRICSET_MODULE, source.beats),
                    ...termQuery(DATASTREAM_DATASET, source.otel),
                  ]
                : [],
            },
          },
        });

        return response.ok({
          body: getHasDataResponseRT.encode({
            hasData: hasDataResponse.hits.total.value > 0,
          }),
        });
      } catch (err) {
        if (Boom.isBoom(err)) {
          return response.customError({
            statusCode: err.output.statusCode,
            body: { message: err.output.payload.message },
          });
        }

        return response.customError({
          statusCode: err.statusCode ?? 500,
          body: {
            message: err.message ?? 'An unexpected error occurred',
          },
        });
      }
    }
  );

  framework.registerRoute(
    {
      method: 'get',
      path: '/api/metrics/source/time_range_metadata',
      validate: {
        query: createRouteValidationFunction(getTimeRangeMetadataQueryParamsRT),
      },
    },
    async (context, request, response) => {
      try {
        const { from, to, dataSource, kuery } = request.query;
        const infraMetricsClient = await getInfraMetricsClient({
          request,
          libs,
          context,
        });
        const source = integrationNameByEntityType[dataSource];

        const [ecsResponse, otelResponse] = (
          await infraMetricsClient.msearch([
            {
              track_total_hits: true,
              terminate_after: 1,
              size: 0,
              query: {
                bool: {
                  should: [
                    ...termsQuery(EVENT_MODULE, source.beats),
                    ...termsQuery(METRICSET_MODULE, source.beats),
                  ],
                  minimum_should_match: 1,
                  filter: [...rangeQuery(from, to), ...kqlQuery(kuery)],
                },
              },
            },
            {
              track_total_hits: true,
              terminate_after: 1,
              size: 0,
              query: {
                bool: {
                  filter: [
                    ...termQuery(DATASTREAM_DATASET, source.otel),
                    ...rangeQuery(from, to),
                    ...kqlQuery(kuery),
                  ],
                },
              },
            },
          ])
        ).responses;
        const hasEcsData = ecsResponse.hits.total.value !== 0;
        const hasOtelData = otelResponse.hits.total.value !== 0;

        return response.ok({
          body: getTimeRangeMetadataResponseRT.encode({
            schemas: (
              [DataSchemaFormat.ECS, DataSchemaFormat.SEMCONV] as DataSchemaFormat[]
            ).filter((key) => {
              return (
                (key === DataSchemaFormat.ECS && hasEcsData) ||
                (key === DataSchemaFormat.SEMCONV && hasOtelData)
              );
            }),
          }),
        });
      } catch (err) {
        if (Boom.isBoom(err)) {
          return response.customError({
            statusCode: err.output.statusCode,
            body: { message: err.output.payload.message },
          });
        }

        return response.customError({
          statusCode: err.statusCode ?? 500,
          body: {
            message: err.message ?? 'An unexpected error occurred',
          },
        });
      }
    }
  );
};

const isFulfilled = <Type>(
  promiseSettlement: PromiseSettledResult<Type>
): promiseSettlement is PromiseFulfilledResult<Type> => promiseSettlement.status === 'fulfilled';
