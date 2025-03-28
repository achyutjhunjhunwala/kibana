/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import {
  ELASTIC_HTTP_VERSION_HEADER,
  X_ELASTIC_INTERNAL_ORIGIN_REQUEST,
} from '@kbn/core-http-common';
import {
  INITIAL_REST_VERSION,
  INITIAL_REST_VERSION_INTERNAL,
} from '@kbn/data-views-plugin/server/constants';
import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';
import { configArray } from '../constants';

export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');
  const es = getService('es');

  describe('has user index pattern API', () => {
    configArray.forEach((config) => {
      describe(config.name, () => {
        beforeEach(async () => {
          await esArchiver.emptyKibanaIndex();
          if (await es.indices.exists({ index: 'metrics-test' })) {
            await es.indices.delete({ index: 'metrics-test' });
          }

          if (await es.indices.exists({ index: 'logs-test' })) {
            await es.indices.delete({ index: 'logs-test' });
          }
        });

        const servicePath = `${config.basePath}/has_user_${config.serviceKey}`;

        it('should return false if no index patterns', async () => {
          // Make sure all saved objects including data views are cleared
          await esArchiver.emptyKibanaIndex();
          const response = await supertest
            .get(servicePath)
            .set(ELASTIC_HTTP_VERSION_HEADER, INITIAL_REST_VERSION_INTERNAL)
            .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana');
          expect(response.status).to.be(200);
          expect(response.body.result).to.be(false);
        });

        it('should return true if has index pattern with user data', async () => {
          await esArchiver.load(
            'src/platform/test/api_integration/fixtures/es_archiver/index_patterns/basic_index'
          );
          await supertest
            .post(config.path)
            .set(ELASTIC_HTTP_VERSION_HEADER, INITIAL_REST_VERSION)
            .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana')
            .send({
              override: true,
              [config.serviceKey]: {
                title: 'basic_index',
              },
            });

          const response = await supertest
            .get(servicePath)
            .set(ELASTIC_HTTP_VERSION_HEADER, INITIAL_REST_VERSION_INTERNAL)
            .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana');
          expect(response.status).to.be(200);
          expect(response.body.result).to.be(true);

          await esArchiver.unload(
            'src/platform/test/api_integration/fixtures/es_archiver/index_patterns/basic_index'
          );
        });

        it('should return true if has user index pattern without data', async () => {
          await supertest
            .post(config.path)
            .set(ELASTIC_HTTP_VERSION_HEADER, INITIAL_REST_VERSION)
            .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana')
            .send({
              override: true,
              [config.serviceKey]: {
                title: 'basic_index',
                allowNoIndex: true,
              },
            });

          const response = await supertest
            .get(servicePath)
            .set(ELASTIC_HTTP_VERSION_HEADER, INITIAL_REST_VERSION_INTERNAL)
            .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana');
          expect(response.status).to.be(200);
          expect(response.body.result).to.be(true);
        });
      });
    });
  });
}
