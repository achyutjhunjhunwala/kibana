/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const config = getService('config');
  const security = getService('security');
  const spaces = getService('spaces');

  const isElasticsearchAnonymousAccessEnabled = (
    config.get('esTestCluster.serverArgs') as string[]
  ).some((setting) => setting.startsWith('xpack.security.authc.anonymous'));

  async function getAnonymousCapabilities(spaceId?: string) {
    const apiResponse = await supertest
      .get(`${spaceId ? `/s/${spaceId}` : ''}/internal/security/anonymous_access/capabilities`)
      .expect(200);

    return Object.fromEntries(
      Object.entries(apiResponse.body).filter(
        ([key]) =>
          key === 'discover_v2' ||
          key === 'dashboard_v2' ||
          key === 'visualize_v2' ||
          key === 'maps_v2'
      )
    );
  }

  describe('Anonymous capabilities', () => {
    before(async () => {
      await spaces.create({
        id: 'space-a',
        name: 'space-a',
        disabledFeatures: ['discover_v2', 'visualize_v2'],
      });
      await spaces.create({
        id: 'space-b',
        name: 'space-b',
        disabledFeatures: ['dashboard_v2', 'maps_v2'],
      });
    });

    after(async () => {
      await spaces.delete('space-a');
      await spaces.delete('space-b');
    });

    describe('without anonymous service account', () => {
      it('all capabilities should be disabled', async () => {
        expectSnapshot(await getAnonymousCapabilities()).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
        expectSnapshot(await getAnonymousCapabilities('space-a')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
        expectSnapshot(await getAnonymousCapabilities('space-b')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
      });
    });

    describe('with anonymous service account without roles', () => {
      if (!isElasticsearchAnonymousAccessEnabled) {
        before(async () => {
          await security.user.create('anonymous_user', {
            password: 'changeme',
            roles: [],
            full_name: 'Guest',
          });
        });

        after(async () => {
          await security.user.delete('anonymous_user');
        });
      }

      it('all capabilities should be disabled', async () => {
        expectSnapshot(await getAnonymousCapabilities()).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
        expectSnapshot(await getAnonymousCapabilities('space-a')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
        expectSnapshot(await getAnonymousCapabilities('space-b')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);
      });
    });

    describe('with properly configured anonymous service account', () => {
      before(async () => {
        await security.role.create('anonymous_role', {
          elasticsearch: { cluster: [], indices: [], run_as: [] },
          kibana: [
            { spaces: ['default'], base: ['read'], feature: {} },
            { spaces: ['space-a'], base: [], feature: { discover: ['read'], maps: ['read'] } },
            {
              spaces: ['space-b'],
              base: [],
              feature: { dashboard: ['read'], visualize: ['read'] },
            },
          ],
        });

        if (!isElasticsearchAnonymousAccessEnabled) {
          await security.user.create('anonymous_user', {
            password: 'changeme',
            roles: ['anonymous_role'],
            full_name: 'Guest',
          });
        }
      });

      after(async () => {
        await security.role.delete('anonymous_role');

        if (!isElasticsearchAnonymousAccessEnabled) {
          await security.user.delete('anonymous_user');
        }
      });

      it('capabilities should be properly defined', async () => {
        // Discover, dashboards, visualizations and maps should be available in read-only mode.
        expectSnapshot(await getAnonymousCapabilities()).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": true,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": true,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": true,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": true,
            },
          }
        `);

        // Only maps should be available in read-only mode, the rest should be disabled.
        expectSnapshot(await getAnonymousCapabilities('space-a')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": true,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": false,
            },
          }
        `);

        // Only visualizations should be available in read-only mode, the rest should be disabled.
        expectSnapshot(await getAnonymousCapabilities('space-b')).toMatchInline(`
          Object {
            "dashboard_v2": Object {
              "createNew": false,
              "createShortUrl": false,
              "downloadCsv": false,
              "generateScreenshot": false,
              "show": false,
              "showWriteControls": false,
              "storeSearchSession": false,
            },
            "discover_v2": Object {
              "createShortUrl": false,
              "generateCsv": false,
              "save": false,
              "show": false,
              "storeSearchSession": false,
            },
            "maps_v2": Object {
              "save": false,
              "show": false,
            },
            "visualize_v2": Object {
              "createShortUrl": false,
              "delete": false,
              "generateScreenshot": false,
              "save": false,
              "show": true,
            },
          }
        `);
      });
    });
  });
}
