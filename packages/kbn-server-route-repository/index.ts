/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export { formatRequest, parseEndpoint } from '@kbn/server-route-repository-utils';
export { createServerRouteFactory } from './src/create_server_route_factory';
export { decodeRequestParams } from './src/decode_request_params';
export { routeValidationObject } from './src/route_validation_object';
export { registerRoutes } from './src/register_routes';

export type {
  RouteRepositoryClient,
  ReturnOf,
  EndpointOf,
  ClientRequestParamsOf,
  DecodedRequestParamsOf,
  ServerRouteRepository,
  ServerRoute,
  RouteParamsRT,
  RouteState,
  DefaultRouteCreateOptions,
  DefaultRouteHandlerResources,
} from '@kbn/server-route-repository-utils';
