/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { PREBUILT_SAVED_OBJECTS_BULK_CREATE } from '../../../../../common/constants';
import {
  serverMock,
  requestContextMock,
  requestMock,
} from '../../../detection_engine/routes/__mocks__';
import { getEmptySavedObjectsResponse } from '../../../detection_engine/routes/__mocks__/request_responses';
import { createRiskScoreTag } from '../helpers/create_risk_score_tag';
import { createPrebuiltSavedObjectsRoute } from './create_prebuilt_saved_objects';

jest.mock('../helpers/create_risk_score_tag', () => {
  const actual = jest.requireActual('../helpers/create_risk_score_tag');
  return {
    ...actual,
    createRiskScoreTag: jest.fn(),
  };
});

jest.mock('uuid', () => {
  return {
    v4: jest
      .fn()
      .mockReturnValueOnce('id-1')
      .mockReturnValueOnce('id-2')
      .mockReturnValueOnce('id-3')
      .mockReturnValueOnce('id-4')
      .mockReturnValueOnce('id-5')
      .mockReturnValueOnce('id-6')
      .mockReturnValueOnce('id-7')
      .mockReturnValueOnce('id-8')
      .mockReturnValueOnce('id-9')
      .mockReturnValueOnce('id-10')
      .mockReturnValueOnce('id-11'),
  };
});

const createPrebuiltSavedObjectsRequest = (savedObjectTemplate: string) =>
  requestMock.create({
    method: 'post',
    path: PREBUILT_SAVED_OBJECTS_BULK_CREATE,
    params: { template_name: savedObjectTemplate },
  });

describe('createPrebuiltSavedObjects', () => {
  let server: ReturnType<typeof serverMock.create>;
  let { clients, context } = requestContextMock.createTools();
  const logger = { error: jest.fn() } as unknown as Logger;

  beforeEach(() => {
    jest.clearAllMocks();

    server = serverMock.create();
    ({ clients, context } = requestContextMock.createTools());

    clients.savedObjectsClient.bulkCreate.mockResolvedValue(getEmptySavedObjectsResponse());

    createPrebuiltSavedObjectsRoute(server.router, logger);
  });

  it.each([['hostRiskScoreDashboards'], ['userRiskScoreDashboards']])(
    'should create saved objects from given template - %p',
    async (templateName) => {
      (createRiskScoreTag as jest.Mock).mockResolvedValue({
        [templateName]: {
          success: true,
          error: null,
          body: {
            id: 'mockTagId',
            name: 'my tag',
            description: 'description',
            type: 'tag',
          },
        },
      });
      const response = await server.inject(
        createPrebuiltSavedObjectsRequest(templateName),
        requestContextMock.convertContext(context)
      );

      expect(clients.savedObjectsClient.bulkCreate.mock.calls[0][1]).toEqual({ overwrite: true });
      expect(clients.savedObjectsClient.bulkCreate.mock.calls[0][0]).toMatchSnapshot();

      expect(response.status).toEqual(200);
    }
  );
});
