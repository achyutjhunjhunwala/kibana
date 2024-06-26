/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../../api_integration/ftr_provider_context';
import { installPackage } from '../../packages';

export default function ({ loadTestFile, getService }: FtrProviderContext) {
  describe('Kibana', () => {
    before(async () => await installPackage(getService('supertest'), 'kibana'));

    loadTestFile(require.resolve('./overview'));
    loadTestFile(require.resolve('./instances'));
  });
}
