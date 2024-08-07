/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import type { ExceptionListSchema } from '@kbn/securitysolution-io-ts-list-types';
import { EXCEPTION_LIST_URL } from '@kbn/securitysolution-list-constants';
import { getExceptionResponseMockWithoutAutoGeneratedValues } from '@kbn/lists-plugin/common/schemas/response/exception_list_schema.mock';
import {
  getCreateExceptionListMinimalSchemaMock,
  getCreateExceptionListMinimalSchemaMockWithoutId,
} from '@kbn/lists-plugin/common/schemas/request/create_exception_list_schema.mock';
import { FtrProviderContext } from '../../../../../ftr_provider_context';

import { deleteAllExceptions, removeExceptionListServerGeneratedProperties } from '../../../utils';

export default ({ getService }: FtrProviderContext) => {
  const supertest = getService('supertest');
  const log = getService('log');
  const utils = getService('securitySolutionUtils');

  describe('@ess @serverless @serverlessQA create_exception_lists', () => {
    describe('creating exception lists', () => {
      afterEach(async () => {
        await deleteAllExceptions(supertest, log);
      });

      it('should create a simple exception list', async () => {
        const { body } = await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMock())
          .expect(200);

        const bodyToCompare = removeExceptionListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(
          getExceptionResponseMockWithoutAutoGeneratedValues(await utils.getUsername())
        );
      });

      it('should create a simple exception list without a list_id', async () => {
        const { body } = await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMockWithoutId())
          .expect(200);

        const bodyToCompare = removeExceptionListServerGeneratedProperties(body);
        const outputtedList: Partial<ExceptionListSchema> = {
          ...getExceptionResponseMockWithoutAutoGeneratedValues(await utils.getUsername()),
          list_id: bodyToCompare.list_id,
        };
        expect(bodyToCompare).to.eql(outputtedList);
      });

      it('should cause a 409 conflict if we attempt to create the same list_id twice', async () => {
        await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMock())
          .expect(200);

        const { body } = await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMock())
          .expect(409);

        expect(body).to.eql({
          message: 'exception list id: "some-list-id" already exists',
          status_code: 409,
        });
      });
    });
  });
};
