/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import expect from '@kbn/expect';
import type { GetBenchmarkResponse } from '@kbn/cloud-security-posture-plugin/common/types/latest';
import { ELASTIC_HTTP_VERSION_HEADER } from '@kbn/core-http-common';
import { FtrProviderContext } from '../../../ftr_provider_context';
import { createPackagePolicy } from '../helper';
export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');
  const kibanaServer = getService('kibanaServer');

  describe('GET /internal/cloud_security_posture/benchmark', () => {
    let agentPolicyId: string;
    let agentPolicyId2: string;
    let agentPolicyId3: string;
    let agentPolicyId4: string;

    beforeEach(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
      await esArchiver.load('x-pack/platform/test/fixtures/es_archives/fleet/empty_fleet_server');

      const { body: agentPolicyResponse } = await supertest
        .post(`/api/fleet/agent_policies`)
        .set(ELASTIC_HTTP_VERSION_HEADER, '2023-10-31')
        .set('kbn-xsrf', 'xxxx')
        .send({
          name: 'Test policy',
          namespace: 'default',
        });

      agentPolicyId = agentPolicyResponse.item.id;

      const { body: agentPolicyResponse2 } = await supertest
        .post(`/api/fleet/agent_policies`)
        .set(ELASTIC_HTTP_VERSION_HEADER, '2023-10-31')
        .set('kbn-xsrf', 'xxxx')
        .send({
          name: 'Test policy 2',
          namespace: 'default',
        });

      agentPolicyId2 = agentPolicyResponse2.item.id;

      const { body: agentPolicyResponse3 } = await supertest
        .post(`/api/fleet/agent_policies`)
        .set(ELASTIC_HTTP_VERSION_HEADER, '2023-10-31')
        .set('kbn-xsrf', 'xxxx')
        .send({
          name: 'Test policy 3',
          namespace: 'default',
        });

      agentPolicyId3 = agentPolicyResponse3.item.id;

      const { body: agentPolicyResponse4 } = await supertest
        .post(`/api/fleet/agent_policies`)
        .set(ELASTIC_HTTP_VERSION_HEADER, '2023-10-31')
        .set('kbn-xsrf', 'xxxx')
        .send({
          name: 'Test policy 4',
          namespace: 'default',
        });

      agentPolicyId4 = agentPolicyResponse4.item.id;

      await createPackagePolicy(
        supertest,
        agentPolicyId,
        'cspm',
        'cloudbeat/cis_aws',
        'aws',
        'cspm',
        'CSPM-1'
      );

      await createPackagePolicy(
        supertest,
        agentPolicyId2,
        'kspm',
        'cloudbeat/cis_k8s',
        'vanilla',
        'kspm',
        'KSPM-1'
      );

      await createPackagePolicy(
        supertest,
        agentPolicyId3,
        'vuln_mgmt',
        'cloudbeat/vuln_mgmt_aws',
        'aws',
        'vuln_mgmt',
        'CNVM-1'
      );

      await createPackagePolicy(
        supertest,
        agentPolicyId4,
        'kspm',
        'cloudbeat/cis_k8s',
        'vanilla',
        'kspm',
        'KSPM-2'
      );
    });

    afterEach(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
      await esArchiver.unload('x-pack/platform/test/fixtures/es_archives/fleet/empty_fleet_server');
    });

    it(`Should return all benchmarks if user has CSP integrations`, async () => {
      const { body: res }: { body: GetBenchmarkResponse } = await supertest
        .get(`/internal/cloud_security_posture/benchmarks`)
        .set(ELASTIC_HTTP_VERSION_HEADER, '2')
        .set('kbn-xsrf', 'xxxx')
        .expect(200);

      expect(res.items.length).equal(5);
    });
  });
}
