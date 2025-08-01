/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const esArchiver = getService('esArchiver');
  const kibanaServer = getService('kibanaServer');
  const security = getService('security');
  const es = getService('es');
  const retry = getService('retry');
  const dataViews = getService('dataViews');

  const { common, discover, timePicker, unifiedFieldList, header } = getPageObjects([
    'common',
    'discover',
    'timePicker',
    'unifiedFieldList',
    'header',
  ]);

  describe('data view flyout', function () {
    before(async () => {
      await security.testUser.setRoles(['kibana_admin', 'test_logstash_reader']);
      await kibanaServer.importExport.load(
        'src/platform/test/functional/fixtures/kbn_archiver/discover.json'
      );
      await esArchiver.loadIfNeeded(
        'src/platform/test/functional/fixtures/es_archiver/logstash_functional'
      );

      await timePicker.setDefaultAbsoluteRangeViaUiSettings();
      await common.navigateToApp('discover');
      await timePicker.setCommonlyUsedTime('This_week');
    });

    after(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
      await esArchiver.unload('x-pack/platform/test/fixtures/es_archives/logstash_functional');
      await es.transport.request({
        path: '/data-view-index-000001',
        method: 'DELETE',
      });
      await es.transport.request({
        path: '/data-view-index-000002',
        method: 'DELETE',
      });
      await es.transport.request({
        path: '/data-view-index-000003',
        method: 'DELETE',
      });
    });

    it('create ad hoc data view', async function () {
      const initialPattern = 'data-view-index-';
      await es.transport.request({
        path: '/data-view-index-000001/_doc',
        method: 'POST',
        body: {
          '@timestamp': new Date().toISOString(),
          a: 'GET /search HTTP/1.1 200 1070000',
        },
      });

      await es.transport.request({
        path: '/data-view-index-000002/_doc',
        method: 'POST',
        body: {
          '@timestamp': new Date().toISOString(),
          b: 'GET /search HTTP/1.1 200 1070000',
        },
      });

      await dataViews.createFromSearchBar({
        name: initialPattern,
        adHoc: true,
        hasTimeField: true,
      });
      await dataViews.waitForSwitcherToBe(`${initialPattern}*`);
      await discover.waitUntilSearchingHasFinished();
      await unifiedFieldList.waitUntilSidebarHasLoaded();

      expect(await discover.getHitCountInt()).to.be(2);
      expect((await unifiedFieldList.getAllFieldNames()).length).to.be(3);
    });

    it('create saved data view', async function () {
      const updatedPattern = 'data-view-index-000001';
      await dataViews.createFromSearchBar({
        name: updatedPattern,
        adHoc: false,
        hasTimeField: true,
      });
      await header.waitUntilLoadingHasFinished();
      await discover.waitUntilSearchingHasFinished();

      await retry.try(async () => {
        expect(await discover.getHitCountInt()).to.be(1);
      });

      await unifiedFieldList.waitUntilSidebarHasLoaded();
      expect((await unifiedFieldList.getAllFieldNames()).length).to.be(2);
    });

    it('update data view with a different time field', async function () {
      const updatedPattern = 'data-view-index-000003';
      await es.transport.request({
        path: '/data-view-index-000003/_doc',
        method: 'POST',
        body: {
          timestamp: new Date('1970-01-01').toISOString(),
          c: 'GET /search HTTP/1.1 200 1070000',
          d: 'GET /search HTTP/1.1 200 1070000',
        },
      });
      for (let i = 0; i < 3; i++) {
        await es.transport.request({
          path: '/data-view-index-000003/_doc',
          method: 'POST',
          body: {
            timestamp: new Date().toISOString(),
            c: 'GET /search HTTP/1.1 200 1070000',
            d: 'GET /search HTTP/1.1 200 1070000',
          },
        });
      }
      await dataViews.editFromSearchBar({ newName: updatedPattern, newTimeField: 'timestamp' });
      await retry.try(async () => {
        expect(await discover.getHitCountInt()).to.be(3);
      });
      await unifiedFieldList.waitUntilSidebarHasLoaded();
      expect((await unifiedFieldList.getAllFieldNames()).length).to.be(3);
      expect(await discover.isChartVisible()).to.be(true);
      expect(await timePicker.timePickerExists()).to.be(true);
    });

    it('update data view with no time field', async function () {
      await dataViews.editFromSearchBar({
        newTimeField: "--- I don't want to use the time filter ---",
      });
      await retry.try(async () => {
        expect(await discover.getHitCountInt()).to.be(4);
      });
      await unifiedFieldList.waitUntilSidebarHasLoaded();
      expect((await unifiedFieldList.getAllFieldNames()).length).to.be(3);
      expect(await discover.isChartVisible()).to.be(false);
      expect(await timePicker.timePickerExists()).to.be(false);
    });
  });
}
