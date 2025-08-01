/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { InternalRenderingRouter } from '../internal_types';
import type { BootstrapRenderer } from './bootstrap_renderer';

export const registerBootstrapRoute = ({
  router,
  renderer,
}: {
  router: InternalRenderingRouter;
  renderer: BootstrapRenderer;
}) => {
  router.get(
    {
      path: '/bootstrap.js',
      security: {
        authz: {
          enabled: false,
          reason: 'This route is only used for serving the bootstrap script.',
        },
      },
      options: {
        tags: ['api'],
        access: 'public',
        excludeFromRateLimiter: true,
      },
      validate: false,
    },
    async (ctx, req, res) => {
      const uiSettingsClient = (await ctx.core).uiSettings.client;
      const { body, etag } = await renderer({ uiSettingsClient, request: req });

      return res.ok({
        body,
        headers: {
          etag,
          'content-type': 'application/javascript',
          'cache-control': 'must-revalidate',
        },
      });
    }
  );
  router.get(
    {
      path: '/bootstrap-anonymous.js',
      security: {
        authz: {
          enabled: false,
          reason: 'This route is only used for serving the bootstrap script.',
        },
      },
      options: {
        authRequired: 'optional',
        tags: ['api'],
        access: 'public',
        excludeFromRateLimiter: true,
      },
      validate: false,
    },
    async (ctx, req, res) => {
      const uiSettingsClient = (await ctx.core).uiSettings.client;
      const { body, etag } = await renderer({
        uiSettingsClient,
        request: req,
        isAnonymousPage: true,
      });

      return res.ok({
        body,
        headers: {
          etag,
          'content-type': 'application/javascript',
          'cache-control': 'must-revalidate',
        },
      });
    }
  );
};
