/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { KibanaExecutionContext } from '@kbn/core/public';
import type { DataView } from '@kbn/data-views-plugin/common';
import { Filter, buildEsQuery, TimeRange, Query } from '@kbn/es-query';
import { getEsQueryConfig } from '@kbn/data-plugin/public';

import { SearchAPI } from './data_model/search_api';
import { TimeCache } from './data_model/time_cache';

import { VegaVisualizationDependencies } from './plugin';
import { VisParams } from './vega_fn';
import { getData, getDataViews } from './services';
import { VegaInspectorAdapters } from './vega_inspector';

interface VegaRequestHandlerParams {
  query: Query;
  filters: Filter[];
  timeRange: TimeRange;
  visParams: VisParams;
  searchSessionId?: string;
  executionContext?: KibanaExecutionContext;
}

interface VegaRequestHandlerContext {
  abortSignal?: AbortSignal;
  inspectorAdapters?: VegaInspectorAdapters;
}

export function createVegaRequestHandler(
  {
    plugins: { data },
    core: { uiSettings, theme },
    getServiceSettings,
  }: VegaVisualizationDependencies,
  context: VegaRequestHandlerContext = {}
) {
  let searchAPI: SearchAPI;
  const { timefilter } = data.query.timefilter;
  const timeCache = new TimeCache(timefilter, 3 * 1000);

  return async function vegaRequestHandler({
    timeRange,
    filters,
    query,
    visParams,
    searchSessionId,
    executionContext,
  }: VegaRequestHandlerParams) {
    const { search } = getData();
    const dataViews = getDataViews();

    if (!searchAPI) {
      searchAPI = new SearchAPI(
        {
          uiSettings,
          search,
          indexPatterns: dataViews,
        },
        context.abortSignal,
        context.inspectorAdapters,
        searchSessionId,
        executionContext
      );
    }

    timeCache.setTimeRange(timeRange);

    let dataView: DataView;
    const firstFilterIndex = filters[0]?.meta.index;
    if (firstFilterIndex) {
      dataView = await dataViews.get(firstFilterIndex).catch(() => undefined);
    }

    const esQueryConfigs = getEsQueryConfig(uiSettings);
    const filtersDsl = buildEsQuery(dataView, query, filters, esQueryConfigs);
    const { VegaParser } = await import('./async_services');

    const vp = new VegaParser(
      visParams.spec,
      searchAPI,
      timeCache,
      filtersDsl,
      getServiceSettings,
      theme.getTheme()
    );
    return await vp.parseAsync();
  };
}
