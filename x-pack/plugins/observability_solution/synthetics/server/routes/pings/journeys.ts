/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { SyntheticsJourneyApiResponse } from '../../../common/runtime_types';
import { getJourneyFailedSteps } from '../../queries/get_journey_failed_steps';
import { getJourneySteps } from '../../queries/get_journey_steps';
import { getJourneyDetails } from '../../queries/get_journey_details';
import { SyntheticsRestApiRouteFactory } from '../types';
import { SYNTHETICS_API_URLS } from '../../../common/constants';

export const createJourneyRoute: SyntheticsRestApiRouteFactory = () => ({
  method: 'GET',
  path: SYNTHETICS_API_URLS.JOURNEY,
  validate: {
    params: schema.object({
      checkGroup: schema.string(),
    }),
  },
  handler: async ({
    syntheticsEsClient,
    request,
    response,
  }): Promise<SyntheticsJourneyApiResponse> => {
    const { checkGroup } = request.params;

    const [steps, details] = await Promise.all([
      getJourneySteps({
        syntheticsEsClient,
        checkGroup,
      }),
      getJourneyDetails({
        syntheticsEsClient,
        checkGroup,
      }),
    ]);

    return {
      steps,
      details,
      checkGroup,
    };
  },
});

export const createJourneyFailedStepsRoute: SyntheticsRestApiRouteFactory = () => ({
  method: 'GET',
  path: SYNTHETICS_API_URLS.JOURNEY_FAILED_STEPS,
  validate: {
    query: schema.object({
      checkGroups: schema.arrayOf(schema.string()),
    }),
  },
  handler: async ({ syntheticsEsClient, request, response }): Promise<any> => {
    const { checkGroups } = request.query;
    try {
      const result = await getJourneyFailedSteps({
        syntheticsEsClient,
        checkGroups,
      });
      return {
        checkGroups,
        steps: result,
      };
    } catch (e) {
      return response.customError({ statusCode: 500, body: e });
    }
  },
});
