/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';
import { getCommonRequestHeader } from '../../../services/ml/common_api';
import { USER } from '../../../services/ml/security_common';
import { testSetupJobConfigs, jobIds, testSetupAnnotations } from './common_jobs';

export default ({ getService }: FtrProviderContext) => {
  const esArchiver = getService('esArchiver');
  const supertest = getService('supertestWithoutAuth');
  const ml = getService('ml');

  describe('delete_annotations', function () {
    before(async () => {
      await esArchiver.loadIfNeeded('x-pack/platform/test/fixtures/es_archives/ml/farequote');
      await ml.testResources.setKibanaTimeZoneToUTC();

      // generate one annotation for each job
      for (let i = 0; i < testSetupJobConfigs.length; i++) {
        const job = testSetupJobConfigs[i];
        const annotationToIndex = testSetupAnnotations[i];
        // @ts-expect-error not full interface
        await ml.api.createAnomalyDetectionJob(job);
        await ml.api.indexAnnotation(annotationToIndex);
      }
    });

    after(async () => {
      await ml.api.cleanMlIndices();
    });

    it('should delete annotation by id', async () => {
      const annotationsForJob = await ml.api.getAnnotations(jobIds[0]);
      expect(annotationsForJob).to.have.length(1);

      const annotationIdToDelete = annotationsForJob[0]._id!;

      const { body, status } = await supertest
        .delete(`/internal/ml/annotations/delete/${annotationIdToDelete}`)
        .auth(USER.ML_POWERUSER, ml.securityCommon.getPasswordForUser(USER.ML_POWERUSER))
        .set(getCommonRequestHeader('1'));
      ml.api.assertResponseStatusCode(200, status, body);

      expect(body._id).to.eql(annotationIdToDelete);
      expect(body.result).to.eql('deleted');

      await ml.api.waitForAnnotationNotToExist(annotationIdToDelete);
    });

    it('should delete annotation by id for user with viewer permission', async () => {
      const annotationsForJob = await ml.api.getAnnotations(jobIds[1]);
      expect(annotationsForJob).to.have.length(1);

      const annotationIdToDelete = annotationsForJob[0]._id!;

      const { body, status } = await supertest
        .delete(`/internal/ml/annotations/delete/${annotationIdToDelete}`)
        .auth(USER.ML_VIEWER, ml.securityCommon.getPasswordForUser(USER.ML_VIEWER))
        .set(getCommonRequestHeader('1'));
      ml.api.assertResponseStatusCode(200, status, body);

      expect(body._id).to.eql(annotationIdToDelete);
      expect(body.result).to.eql('deleted');

      await ml.api.waitForAnnotationNotToExist(annotationIdToDelete);
    });

    it('should not delete annotation for unauthorized user', async () => {
      const annotationsForJob = await ml.api.getAnnotations(jobIds[2]);
      expect(annotationsForJob).to.have.length(1);

      const annotationIdToDelete = annotationsForJob[0]._id!;

      const { body, status } = await supertest
        .delete(`/internal/ml/annotations/delete/${annotationIdToDelete}`)
        .auth(USER.ML_UNAUTHORIZED, ml.securityCommon.getPasswordForUser(USER.ML_UNAUTHORIZED))
        .set(getCommonRequestHeader('1'));
      ml.api.assertResponseStatusCode(403, status, body);

      expect(body.error).to.eql('Forbidden');

      await ml.api.waitForAnnotationToExist(annotationIdToDelete);
    });
  });
};
