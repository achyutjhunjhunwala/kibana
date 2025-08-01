/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

require('@kbn/babel-register').install();

const { getPackages } = require('@kbn/repo-packages');
const { REPO_ROOT } = require('@kbn/repo-info');

const APACHE_2_0_LICENSE_HEADER = `
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
`;

const DUAL_ELV1_SSPL1_LICENSE_HEADER = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */
`;

const DUAL_ELV2_SSPL1_LICENSE_HEADER = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
`;

const TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */
`;

const OLD_ELASTIC_LICENSE_HEADER = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
`;

const ELV2_LICENSE_HEADER = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
`;

const SAFER_LODASH_SET_HEADER = `
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See \`src/platform/packages/shared/kbn-safer-lodash-set/LICENSE\` for more information.
 */
`;

const SAFER_LODASH_SET_LODASH_HEADER = `
/*
 * This file is forked from the lodash project (https://lodash.com/),
 * and may include modifications made by Elasticsearch B.V.
 * Elasticsearch B.V. licenses this file to you under the MIT License.
 * See \`src/platform/packages/shared/kbn-safer-lodash-set/LICENSE\` for more information.
 */
`;

const SAFER_LODASH_SET_DEFINITELYTYPED_HEADER = `
/*
 * This file is forked from the DefinitelyTyped project (https://github.com/DefinitelyTyped/DefinitelyTyped),
 * and may include modifications made by Elasticsearch B.V.
 * Elasticsearch B.V. licenses this file to you under the MIT License.
 * See \`src/platform/packages/shared/kbn-safer-lodash-set/LICENSE\` for more information.
 */
`;

const KBN_HANDLEBARS_HEADER = `
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See \`src/platform/packages/private/kbn-handlebars/LICENSE\` for more information.
 */
`;

const KBN_HANDLEBARS_HANDLEBARS_HEADER = `
/*
  * This file is forked from the handlebars project (https://github.com/handlebars-lang/handlebars.js),
  * and may include modifications made by Elasticsearch B.V.
  * Elasticsearch B.V. licenses this file to you under the MIT License.
  * See \`src/platform/packages/private/kbn-handlebars/LICENSE\` for more information.
  */
`;

const VENN_DIAGRAM_HEADER = `
/*
  * This file is forked from the venn.js project (https://github.com/benfred/venn.js/),
  * and may include modifications made by Elasticsearch B.V.
  * Elasticsearch B.V. licenses this file to you under the MIT License.
  * See \`x-pack/platform/plugins/private/graph/public/components/venn_diagram/vennjs/LICENSE\` for more information.
  */
`;

/** Packages which should not be included within production code. */
const DEV_PACKAGE_DIRS = getPackages(REPO_ROOT).flatMap((pkg) =>
  pkg.isDevOnly() ? pkg.normalizedRepoRelativeDir : []
);

/** Directories (at any depth) which include dev-only code. */
const DEV_DIRECTORIES = [
  '.storybook',
  '__tests__',
  '__test__',
  '__jest__',
  '__fixtures__',
  '__mocks__',
  '__stories__',
  'e2e',
  'cypress',
  'fixtures',
  'ftr_e2e',
  'integration_tests',
  'manual_tests',
  'mock',
  'mocks',
  'storybook',
  'scripts',
  'test',
  'test-d',
  'test_utils',
  'test_utilities',
  'test_helpers',
  'tests_client_integration',
  'tsd_tests',
];

/** File patterns for dev-only code. */
const DEV_FILE_PATTERNS = [
  '*.mock.{js,ts,tsx}',
  '*.test.{js,ts,tsx}',
  '*.test.helpers.{js,ts,tsx}',
  '*.stories.{js,ts,tsx}',
  '*.story.{js,ts,tsx}',
  '*.stub.{js,ts,tsx}',
  'mock.{js,ts,tsx}',
  '_stubs.{js,ts,tsx}',
  '{testHelpers,test_helper,test_utils}.{js,ts,tsx}',
  '{postcss,webpack,cypress}.config.{js,ts}',
];

/** Glob patterns which describe dev-only code. */
const DEV_PATTERNS = [
  ...DEV_PACKAGE_DIRS.map((pkg) => `${pkg}/**/*`),
  ...DEV_DIRECTORIES.map((dir) => `{packages,src,x-pack}/**/${dir}/**/*`),
  ...DEV_FILE_PATTERNS.map((file) => `{packages,src,x-pack}/**/${file}`),
  'src/platform/packages/shared/kbn-interpreter/tasks/**/*',
  'src/dev/**/*',
  'x-pack/{dev-tools,tasks,test,test_serverless,build_chromium}/**/*',
  'x-pack/performance/**/*',
  'src/setup_node_env/index.js',
  'src/cli/dev.js',
  'src/platform/packages/shared/kbn-esql-ast/scripts/**/*',
];

/** Restricted imports with suggested alternatives */
const RESTRICTED_IMPORTS = [
  {
    name: 'lodash',
    importNames: ['set', 'setWith', 'template'],
    message:
      'lodash.set/setWith: Please use @kbn/safer-lodash-set instead.\n' +
      'lodash.template: Function is unsafe, and not compatible with our content security policy.',
  },
  {
    name: 'lodash.set',
    message: 'Please use @kbn/safer-lodash-set/set instead',
  },
  {
    name: 'lodash.setwith',
    message: 'Please use @kbn/safer-lodash-set/setWith instead',
  },
  {
    name: 'lodash/set',
    message: 'Please use @kbn/safer-lodash-set/set instead',
  },
  {
    name: 'lodash/setWith',
    message: 'Please use @kbn/safer-lodash-set/setWith instead',
  },
  {
    name: 'lodash/fp',
    importNames: ['set', 'setWith', 'assoc', 'assocPath', 'template'],
    message:
      'lodash.set/setWith/assoc/assocPath: Please use @kbn/safer-lodash-set/fp instead\n' +
      'lodash.template: Function is unsafe, and not compatible with our content security policy.',
  },
  {
    name: 'lodash/fp/set',
    message: 'Please use @kbn/safer-lodash-set/fp/set instead',
  },
  {
    name: 'lodash/fp/setWith',
    message: 'Please use @kbn/safer-lodash-set/fp/setWith instead',
  },
  {
    name: 'lodash/fp/assoc',
    message: 'Please use @kbn/safer-lodash-set/fp/assoc instead',
  },
  {
    name: 'lodash/fp/assocPath',
    message: 'Please use @kbn/safer-lodash-set/fp/assocPath instead',
  },
  {
    name: 'lodash.template',
    message: 'lodash.template is unsafe, and not compatible with our content security policy.',
  },
  {
    name: 'lodash/template',
    message: 'lodash.template is unsafe, and not compatible with our content security policy.',
  },
  {
    name: 'lodash/fp/template',
    message: 'lodash.template is unsafe, and not compatible with our content security policy.',
  },
  {
    name: 'react-use',
    message: 'Please use react-use/lib/{method} instead.',
  },
  {
    name: 'react-use/lib',
    message: 'Please use react-use/lib/{method} instead.',
  },
  {
    name: 'react-router-dom',
    importNames: ['Router', 'Switch', 'Route'],
    message: 'Please use @kbn/shared-ux-router instead',
  },
  {
    name: '@kbn/kibana-react-plugin/public',
    importNames: ['Route'],
    message: 'Please use @kbn/shared-ux-router instead',
  },
  {
    name: 'rxjs/operators',
    message:
      'Please, use rxjs instead: rxjs/operators is just a subset, unnecessarily duplicating the package import.',
  },
  {
    name: '@testing-library/react-hooks',
    message: 'Please use @testing-library/react instead',
  },
  ...[
    'Alt',
    'Alternative',
    'Applicative',
    'Apply',
    'Array',
    'Bifunctor',
    'boolean',
    'BooleanAlgebra',
    'Bounded',
    'BoundedDistributiveLattice',
    'BoundedJoinSemilattice',
    'BoundedLattice',
    'BoundedMeetSemilattice',
    'Category',
    'Chain',
    'ChainRec',
    'Choice',
    'Comonad',
    'Compactable',
    'Console',
    'Const',
    'Contravariant',
    'Date',
    'DistributiveLattice',
    'Either',
    'EitherT',
    'Eq',
    'Extend',
    'Field',
    'Filterable',
    'FilterableWithIndex',
    'Foldable',
    'FoldableWithIndex',
    'function',
    'Functor',
    'FunctorWithIndex',
    'Group',
    'HeytingAlgebra',
    'Identity',
    'Invariant',
    'IO',
    'IOEither',
    'IORef',
    'JoinSemilattice',
    'Lattice',
    'Magma',
    'Map',
    'MeetSemilattice',
    'Monad',
    'MonadIO',
    'MonadTask',
    'MonadThrow',
    'Monoid',
    'NonEmptyArray',
    'Option',
    'OptionT',
    'Ord',
    'Ordering',
    'pipeable',
    'Profunctor',
    'Random',
    'Reader',
    'ReaderEither',
    'ReaderT',
    'ReaderTask',
    'ReaderTaskEither',
    'ReadonlyArray',
    'ReadonlyMap',
    'ReadonlyNonEmptyArray',
    'ReadonlyRecord',
    'ReadonlySet',
    'ReadonlyTuple',
    'Record',
    'Ring',
    'Semigroup',
    'Semigroupoid',
    'Semiring',
    'Set',
    'Show',
    'State',
    'StateReaderTaskEither',
    'StateT',
    'Store',
    'Strong',
    'Task',
    'TaskEither',
    'TaskThese',
    'These',
    'TheseT',
    'Traced',
    'Traversable',
    'TraversableWithIndex',
    'Tree',
    'Tuple',
    'Unfoldable',
    'ValidationT',
    'Witherable',
    'Writer',
    'WriterT',
  ].map((subset) => {
    return {
      name: `fp-ts/lib/${subset}`,
      message: `Please, use fp-ts/${subset} to avoid duplicating the package import`,
    };
  }),
  {
    name: `fp-ts/lib`,
    message: `Please, use fp-ts to avoid duplicating the package import`,
  },
];

/**
 * Imports that are deprecated and should be phased out
 * They are not restricted until fully removed,
 * but will log a warning
 **/
const DEPRECATED_IMPORTS = [
  {
    name: 'enzyme',
    message:
      'Enzyme is deprecated and no longer maintained. Please use @testing-library/react instead.',
  },
];

module.exports = {
  root: true,

  extends: ['@kbn/eslint-config'],

  overrides: [
    /**
     * Temporarily disable some react rules for specific plugins, remove in separate PRs
     */
    {
      files: ['src/platform/plugins/shared/kibana_react/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
    {
      files: ['src/platform/plugins/shared/kibana_utils/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'react-hooks/exhaustive-deps': 'off',
      },
    },
    {
      files: ['x-pack/platform/plugins/private/canvas/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'off',
      },
    },
    {
      files: ['x-pack/platform/plugins/private/cross_cluster_replication/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'off',
      },
    },
    /**
     * FormatJS linter for i18n code.
     * https://formatjs.io/docs/tooling/linter
     */
    {
      files: [
        'src/**/*.{js,mjs,ts,tsx}',
        'x-pack/**/*.{js,mjs,ts,tsx}',
        'packages/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/**/*.{js,mjs,ts,tsx}',
        'src/core/packages/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/*/packages/**/*.{js,mjs,ts,tsx}',
      ],
      plugins: ['formatjs'],
      rules: {
        'formatjs/enforce-default-message': ['error', 'anything'],
        'formatjs/enforce-description': 'off',
      },
    },
    /**
     * Files that require triple-license headers, settings
     * are overridden below for files that require Elastic
     * Licence headers
     */
    {
      files: ['**/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * Files that require Apache headers
     */
    {
      files: [
        'packages/kbn-eslint-config/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/shared/kbn-datemath/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: APACHE_2_0_LICENSE_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * New Platform client-side
     */
    {
      files: ['{src,x-pack}/plugins/*/public/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'import/no-commonjs': 'error',
      },
    },

    /**
     * Files that require Elastic license headers instead of dual-license header
     */
    {
      files: ['x-pack/**/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: ELV2_LICENSE_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * safer-lodash-set package requires special license headers
     */
    {
      files: ['src/platform/packages/shared/kbn-safer-lodash-set/**/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: SAFER_LODASH_SET_LODASH_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    {
      files: ['src/platform/packages/shared/kbn-safer-lodash-set/test/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: SAFER_LODASH_SET_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },
    {
      files: ['src/platform/packages/shared/kbn-safer-lodash-set/**/*.d.ts'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * @kbn/handlebars package requires special license headers
     */
    {
      files: ['src/platform/packages/private/kbn-handlebars/**/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: KBN_HANDLEBARS_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },
    {
      files: ['src/platform/packages/private/kbn-handlebars/src/spec/**/*.{js,mjs,ts,tsx}'],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: KBN_HANDLEBARS_HANDLEBARS_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              VENN_DIAGRAM_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * venn.js fork requires special license headers
     */
    {
      files: [
        'x-pack/platform/plugins/private/graph/public/components/venn_diagram/vennjs/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@kbn/eslint/require-license-header': [
          'error',
          {
            license: VENN_DIAGRAM_HEADER,
          },
        ],
        '@kbn/eslint/disallow-license-headers': [
          'error',
          {
            licenses: [
              APACHE_2_0_LICENSE_HEADER,
              TRIPLE_ELV2_SSPL1_AGPL3_LICENSE_HEADER,
              DUAL_ELV2_SSPL1_LICENSE_HEADER,
              DUAL_ELV1_SSPL1_LICENSE_HEADER,
              ELV2_LICENSE_HEADER,
              OLD_ELASTIC_LICENSE_HEADER,
              SAFER_LODASH_SET_HEADER,
              SAFER_LODASH_SET_LODASH_HEADER,
              SAFER_LODASH_SET_DEFINITELYTYPED_HEADER,
              KBN_HANDLEBARS_HEADER,
              KBN_HANDLEBARS_HANDLEBARS_HEADER,
            ],
          },
        ],
      },
    },

    /**
     * Allow default exports
     */
    {
      files: [
        '**/*.stories.tsx',
        '**/*.test.js',
        'src/platform/test/*/config.ts',
        'src/platform/test/*/config_open.ts',
        'src/platform/test/*/*.config.ts',
        'src/platform/test/*/{tests,test_suites,apis,apps}/**/*',
        'src/platform/test/server_integration/**/*.ts',
        'x-pack/test/functional/apps/**/*.js',
        'x-pack/solutions/observability/plugins/apm/**/*.js',
        'x-pack/platform/test/*/{tests,test_suites,apis,apps}/**/*',
        'x-pack/platform/test/*api_integration*/**/*',
        'x-pack/platform/test/*/*config.*ts',
        'x-pack/solutions/*/test/**/{tests,test_suites,apis,apps,fixtures,index.ts}/**/*',
        'x-pack/solutions/*/test/**/*config*.ts',
        'x-pack/solutions/*/test/**/tests/**/*',
        'x-pack/solutions/*/test/api_integration_deployment_agnostic/*configs/**/*',
        'x-pack/solutions/*/test/alerting_api_integration/**/*',
        'x-pack/test/*/{tests,test_suites,apis,apps}/**/*',
        'x-pack/test/*/*config.*ts',
        'x-pack/platform/test/saved_object_api_integration/*/apis/**/*',
        'x-pack/platform/test/ui_capabilities/*/tests/**/*',
        'x-pack/platform/test/upgrade_assistant_integration/**/*',
        'x-pack/test/performance/**/*.ts',
        '**/cypress.config.{js,ts}',
        'x-pack/test_serverless/**/config*.ts',
        'x-pack/platform/test/serverless/shared/config*.ts',
        'x-pack/platform/test/serverless/*/test_suites/**/*',
        'x-pack/platform/test/serverless/*/configs/**/*',
        'x-pack/test_serverless/*/test_suites/**/*',
        'x-pack/test/profiling_api_integration/**/*.ts',
        'x-pack/test/security_solution_api_integration/*/test_suites/**/*',
        'x-pack/test/security_solution_api_integration/**/config*.ts',
        '**/playwright.config.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-named-as-default': 'off',
      },
    },

    /**
     * Single package.json rules, it tells eslint to ignore the child package.json files
     * and look for dependencies declarations in the single and root level package.json
     */
    {
      files: ['{src,x-pack,packages}/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            /* Files that ARE allowed to use devDependencies */
            devDependencies: [...DEV_PATTERNS],
            peerDependencies: true,
            packageDir: '.',
          },
        ],
      },
    },

    /**
     * Files that run BEFORE node version check
     */
    {
      files: ['scripts/**/*.js', 'src/setup_node_env/**/*.js'],
      rules: {
        'import/no-commonjs': 'off',
        'prefer-object-spread': 'off',
        'no-var': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'no-restricted-syntax': [
          'error',
          'ImportDeclaration',
          'ExportNamedDeclaration',
          'ExportDefaultDeclaration',
          'ExportAllDeclaration',
          'ArrowFunctionExpression',
          'AwaitExpression',
          'ClassDeclaration',
          'RestElement',
          'SpreadElement',
          'YieldExpression',
          'VariableDeclaration[kind="const"]',
          'VariableDeclaration[kind="let"]',
          'VariableDeclarator[id.type="ArrayPattern"]',
          'VariableDeclarator[id.type="ObjectPattern"]',
        ],
      },
    },

    /**
     * Files that run in the browser with only node-level transpilation
     */
    {
      files: [
        'src/platform/packages/shared/kbn-ftr-common-functional-ui-services/services/web_element_wrapper/scroll_into_view_if_necessary.js',
        '**/browser_exec_scripts/**/*.js',
      ],
      rules: {
        'prefer-object-spread': 'off',
        'no-var': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'no-restricted-syntax': [
          'error',
          'ArrowFunctionExpression',
          'AwaitExpression',
          'ClassDeclaration',
          'ImportDeclaration',
          'RestElement',
          'SpreadElement',
          'YieldExpression',
          'VariableDeclaration[kind="const"]',
          'VariableDeclaration[kind="let"]',
          'VariableDeclarator[id.type="ArrayPattern"]',
          'VariableDeclarator[id.type="ObjectPattern"]',
        ],
      },
    },

    /**
     * Files that run AFTER node version check
     * and are not also transpiled with babel
     */
    {
      files: [
        '.eslintrc.js',
        'packages/kbn-eslint-plugin-eslint/**/*',
        'x-pack/gulpfile.js',
        'x-pack/scripts/*.js',
        '**/jest.config.js',
      ],
      excludedFiles: ['**/integration_tests/**/*'],
      rules: {
        'import/no-commonjs': 'off',
        'prefer-object-spread': 'off',
        'no-restricted-syntax': [
          'error',
          'ImportDeclaration',
          'ExportNamedDeclaration',
          'ExportDefaultDeclaration',
          'ExportAllDeclaration',
        ],
      },
    },
    /**
     * Jest specific rules
     */
    {
      files: ['**/*.test.{js,mjs,ts,tsx}'],
      rules: {
        'jest/valid-describe-callback': 'error',
      },
    },

    /**
     * Harden specific rules
     */
    {
      files: [
        'src/platform/test/harden/*.js',
        'src/platform/packages/shared/kbn-safer-lodash-set/test/*.js',
      ],
      rules: {
        'mocha/handle-done-callback': 'off',
      },
    },
    {
      files: ['**/*.{js,mjs,ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', ...RESTRICTED_IMPORTS],
        '@kbn/eslint/no_deprecated_imports': ['warn', ...DEPRECATED_IMPORTS],
        'no-restricted-modules': [
          'error',
          {
            name: 'lodash.set',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            name: 'lodash.setwith',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            name: 'lodash.template',
            message:
              'lodash.template is unsafe, and not compatible with our content security policy.',
          },
          {
            name: 'lodash/set',
            message: 'Please use @kbn/safer-lodash-set/set instead',
          },
          {
            name: 'lodash/setWith',
            message: 'Please use @kbn/safer-lodash-set/setWith instead',
          },
          {
            name: 'lodash/fp/set',
            message: 'Please use @kbn/safer-lodash-set/fp/set instead',
          },
          {
            name: 'lodash/fp/setWith',
            message: 'Please use @kbn/safer-lodash-set/fp/setWith instead',
          },
          {
            name: 'lodash/fp/assoc',
            message: 'Please use @kbn/safer-lodash-set/fp/assoc instead',
          },
          {
            name: 'lodash/fp/assocPath',
            message: 'Please use @kbn/safer-lodash-set/fp/assocPath instead',
          },
          {
            name: 'lodash/fp/template',
            message:
              'lodash.template is unsafe, and not compatible with our content security policy.',
          },
          {
            name: 'lodash/template',
            message:
              'lodash.template is unsafe, and not compatible with our content security policy.',
          },
        ],
        'no-restricted-properties': [
          'error',
          {
            object: 'lodash',
            property: 'set',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: '_',
            property: 'set',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: 'lodash',
            property: 'setWith',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: '_',
            property: 'setWith',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: 'lodash',
            property: 'assoc',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: '_',
            property: 'assoc',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: 'lodash',
            property: 'assocPath',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: '_',
            property: 'assocPath',
            message: 'Please use @kbn/safer-lodash-set instead',
          },
          {
            object: 'lodash',
            property: 'template',
            message:
              'lodash.template is unsafe, and not compatible with our content security policy.',
          },
          {
            object: '_',
            property: 'template',
            message:
              'lodash.template is unsafe, and not compatible with our content security policy.',
          },
        ],
      },
    },
    {
      files: ['**/common/**/*.{js,mjs,ts,tsx}', '**/public/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          ...RESTRICTED_IMPORTS,
          {
            name: 'semver',
            message: 'Please use "semver/*/{function}" instead',
          },
        ],
      },
    },

    /**
     * APM, UX and Observability overrides
     */
    {
      files: [
        'x-pack/solutions/observability/plugins/apm/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/observability/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/exploratory_view/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/ux/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/slo/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/packages/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        'no-console': ['warn', { allow: ['error'] }],
        'react/function-component-definition': [
          'warn',
          {
            namedComponents: 'function-declaration',
            unnamedComponents: 'arrow-function',
          },
        ],
        'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      },
    },
    {
      files: [
        'x-pack/solutions/observability/plugins/apm/**/*.stories.*',
        'x-pack/solutions/observability/plugins/observability/**/*.stories.*',
        'x-pack/solutions/observability/plugins/exploratory_view/**/*.stories.*',
        'x-pack/solutions/observability/plugins/slo/**/*.stories.*',
        'x-pack/solutions/observability/packages/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        'react/function-component-definition': [
          'off',
          {
            namedComponents: 'function-declaration',
            unnamedComponents: 'arrow-function',
          },
        ],
      },
    },
    {
      files: [
        'x-pack/platform/plugins/shared/observability_solution/**/*.{ts,tsx}',
        'x-pack/solutions/observability/plugins/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/{streams,streams_app}/**/*.{ts,tsx}',
        'x-pack/solutions/observability/packages/**/*.{ts,tsx}',
      ],
      rules: {
        'react-hooks/exhaustive-deps': [
          'error',
          {
            additionalHooks:
              '^(useUrl|useAbortableAsync|useMemoWithAbortSignal|useFetcher|useProgressiveFetcher|useBreadcrumb|useAsync|useTimeRangeAsync|useAutoAbortedHttpClient|use.*Fetch)$',
          },
        ],
      },
    },
    {
      files: [
        'x-pack/platform/plugins/shared/aiops/**/*.tsx',
        'x-pack/platform/plugins/shared/observability_solution/**/*.{ts,tsx}',
        'x-pack/solutions/observability/plugins/**/*.{ts,tsx}',
        'src/platform/plugins/shared/ai_assistant_management/**/*.tsx',
        'x-pack/solutions/observability/packages/**/*.{ts,tsx}',
      ],
      rules: {
        '@kbn/telemetry/event_generating_elements_should_be_instrumented': 'error',
      },
    },
    {
      files: ['x-pack/solutions/search/**/*.tsx'],
      rules: {
        '@kbn/telemetry/event_generating_elements_should_be_instrumented': 'warn',
      },
    },
    {
      files: [
        'x-pack/solutions/observability/plugins/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
        'x-pack/solutions/observability/packages/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
        'src/platform/plugins/shared/ai_assistant_management/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
      ],
      rules: {
        '@kbn/i18n/strings_should_be_translated_with_i18n': 'warn',
        '@kbn/i18n/i18n_translate_should_start_with_the_right_id': 'warn',
        '@kbn/i18n/formatted_message_should_start_with_the_right_id': 'warn',
      },
    },
    {
      files: [
        'x-pack/solutions/observability/plugins/apm/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
        'x-pack/solutions/observability/plugins/infra/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
        'x-pack/solutions/observability/plugins/profiling/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
        'x-pack/solutions/observability/plugins/observability_shared/**/!(*.stories.tsx|*.test.tsx|*.storybook_decorator.tsx|*.mock.tsx)',
      ],
      rules: {
        '@kbn/eui-a11y/eui_elements_should_have_aria_label_or_aria_labelledby_props': 'warn',
      },
    },
    {
      // require explicit return types in route handlers for performance reasons
      files: ['x-pack/solutions/observability/plugins/apm/server/**/route.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowTypedFunctionExpressions: false,
          },
        ],
      },
    },
    {
      files: [
        'x-pack/solutions/observability/plugins/apm/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/apm_data_access/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/infra/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/inventory/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/metrics_data_access/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/profiling/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/observability/plugins/profiling_data_access/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },

    /**
     * Fleet overrides
     */
    {
      files: ['x-pack/platform/plugins/shared/fleet/**/*.{js,mjs,ts,tsx}'],
      plugins: ['testing-library'],
      rules: {
        'testing-library/await-async-utils': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        'import/order': [
          'warn',
          {
            groups: ['builtin', 'external', 'internal', 'parent'],
            'newlines-between': 'always-and-inside-groups',
          },
        ],
      },
    },

    /**
     * Integration assistant overrides
     */
    {
      // front end and common typescript and javascript files only
      files: [
        'x-pack/platform/plugins/shared/automatic_import/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/automatic_import/common/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        'import/no-nodejs-modules': 'error',
        'no-duplicate-imports': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        'no-restricted-imports': [
          'error',
          {
            // prevents UI code from importing server side code and then webpack including it when doing builds
            patterns: ['**/server/*'],
            paths: RESTRICTED_IMPORTS,
          },
        ],
      },
    },

    /**
     * ML overrides
     */
    {
      files: [
        'x-pack/platform/plugins/shared/aiops/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/private/data_visualizer/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/ml/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/private/transform/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/ml/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/private/ml/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/private/file_upload/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },

    /**
     * Security Solution overrides. These rules below are maintained and owned by
     * the people within the security-detection-engine team. Please see ping them
     * or check with them if you are encountering issues, have suggestions, or would
     * like to add, change, or remove any particular rule. Linters, Typescript, and rules
     * evolve and change over time just like coding styles, so please do not hesitate to
     * reach out.
     */
    {
      // front end and common typescript and javascript files only
      files: [
        'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/elastic_assistant/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant-common/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/packages/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/common/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/cases/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/cases/common/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/shared/kbn-cell-actions/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        'import/no-nodejs-modules': 'error',
        'no-duplicate-imports': 'off',
        '@typescript-eslint/no-duplicate-imports': ['error'],
        'no-restricted-imports': [
          'error',
          {
            // prevents UI code from importing server side code and then webpack including it when doing builds
            patterns: ['**/server/*'],
            paths: RESTRICTED_IMPORTS,
          },
        ],
      },
    },
    {
      // typescript only for front and back end, but excludes the test files.
      // We use this section to add rules in which we do not want to apply to test files.
      // This should be a very small set as most linter rules are useful for tests as well.
      files: [
        'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/elastic_assistant/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/automatic_import/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant-common/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-langchain/**/*.{ts,tsx}',
        'x-pack/solutions/security/packages/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/cases/**/*.{ts,tsx}',
        'src/platform/packages/shared/kbn-cell-actions/**/*.{js,mjs,ts,tsx}',
      ],
      excludedFiles: [
        'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/solutions/security/plugins/elastic_assistant/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/plugins/shared/automatic_import/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant-common/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-langchain/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/solutions/security/packages/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/**/*.{test,mock,test_helper}.{ts,tsx}',
        'x-pack/platform/plugins/shared/cases/**/*.{test,mock,test_helper}.{ts,tsx}',
        'src/platform/packages/shared/kbn-cell-actions/**/*.{test,mock,test_helper}.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'error',
      },
    },
    {
      // typescript only for front and back end
      files: [
        'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/elastic_assistant/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/automatic_import/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant-common/**/*.{ts,tsx}',
        'x-pack/platform/packages/shared/kbn-langchain/**/*.{ts,tsx}',
        'x-pack/solutions/security/packages/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/**/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/cases/**/*.{ts,tsx}',
        'src/platform/packages/shared/kbn-cell-actions/**/*.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/unified-signatures': 'error',
        'no-restricted-imports': [
          'error',
          {
            // prevents code from importing files that contain the name "legacy" within their name. This is a mechanism
            // to help deprecation and prevent accidental re-use/continued use of code we plan on removing. If you are
            // finding yourself turning this off a lot for "new code" consider renaming the file and functions if it is has valid uses.
            patterns: ['*legacy*'],
            paths: RESTRICTED_IMPORTS,
          },
        ],
      },
    },
    {
      // typescript and javascript for front and back end
      files: [
        'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/elastic_assistant/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/automatic_import/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/kbn-elastic-assistant-common/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/kbn-langchain/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/packages/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_ess/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/security_solution_serverless/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/timelines/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/plugins/shared/cases/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/packages/data-stream-adapter/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/shared/kbn-cell-actions/**/*.{js,mjs,ts,tsx}',
      ],
      plugins: ['eslint-plugin-node', 'react'],
      env: {
        jest: true,
      },
      rules: {
        'accessor-pairs': 'error',
        'array-callback-return': 'error',
        'no-array-constructor': 'error',
        complexity: 'warn',
        'node/no-deprecated-api': 'error',
        'no-bitwise': 'error',
        'no-continue': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'off',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-ex-assign': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-boolean-cast': 'error',
        'no-extra-label': 'error',
        'no-func-assign': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-invalid-regexp': 'error',
        'no-inner-declarations': 'error',
        'no-lone-blocks': 'error',
        'no-multi-assign': 'error',
        'no-misleading-character-class': 'error',
        'no-new-symbol': 'error',
        'no-obj-calls': 'error',
        'no-param-reassign': 'error',
        'no-process-exit': 'error',
        'no-prototype-builtins': 'error',
        'no-return-await': 'error',
        'no-self-compare': 'error',
        'no-shadow-restricted-names': 'error',
        'no-sparse-arrays': 'error',
        'no-this-before-super': 'error',
        // rely on typescript
        'no-undef': 'off',
        'no-unreachable': 'error',
        'no-unsafe-finally': 'error',
        'no-useless-call': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'one-var-declaration-per-line': 'error',
        'prefer-object-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'react/boolean-prop-naming': 'error',
        'react/button-has-type': 'error',
        'react/display-name': 'error',
        'react/forbid-dom-props': 'error',
        'react/no-access-state-in-setstate': 'error',
        'react/no-children-prop': 'error',
        'react/no-danger-with-children': 'error',
        'react/no-deprecated': 'error',
        'react/no-did-mount-set-state': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-redundant-should-component-update': 'error',
        'react/no-render-return-value': 'error',
        'react/no-typos': 'error',
        'react/no-string-refs': 'error',
        'react/no-this-in-sfc': 'error',
        'react/no-unescaped-entities': 'error',
        'react/no-unsafe': 'error',
        'react/no-unused-prop-types': 'error',
        'react/no-unused-state': 'error',
        'react/sort-default-props': 'error',
        'react/void-dom-elements-no-children': 'error',
        'react/jsx-no-comment-textnodes': 'error',
        'react/jsx-no-literals': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-fragments': 'error',
        'require-atomic-updates': 'error',
        'symbol-description': 'error',
        'vars-on-top': 'error',
        '@typescript-eslint/no-duplicate-imports': ['error'],
      },
      overrides: [
        {
          files: [
            'x-pack/platform/plugins/shared/cases/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/plugins/ecs_data_quality_dashboard/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/plugins/security_solution/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/plugins/security_solution_ess/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/plugins/security_solution_serverless/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/packages/data-stream-adapter/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/packages/features/**/*.{js,mjs,ts,tsx}',
            'x-pack/solutions/security/packages/navigation/**/*.{js,mjs,ts,tsx}',
            'src/platform/packages/shared/kbn-cell-actions/**/*.{js,mjs,ts,tsx}',
          ],
          rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
          },
        },
      ],
    },
    {
      files: ['x-pack/platform/plugins/shared/cases/public/**/*.{js,mjs,ts,tsx}'],
      excludedFiles: ['x-pack/platform/plugins/shared/cases/**/*.{test,mock,test_helper}.{ts,tsx}'],
      rules: {
        'react/display-name': ['error', { ignoreTranspilerName: true }],
      },
    },
    {
      files: ['x-pack/platform/plugins/shared/cases/**/*.{test,mock,test_helper}.tsx'],
      extends: ['plugin:testing-library/react'],
    },

    /**
     * Lists overrides. These rules below are maintained and owned by
     * the people within the security-detection-engine team. Please see ping them
     * or check with them if you are encountering issues, have suggestions, or would
     * like to add, change, or remove any particular rule. Linters, Typescript, and rules
     * evolve and change over time just like coding styles, so please do not hesitate to
     * reach out.
     */
    {
      // front end and common typescript and javascript files only
      files: [
        'x-pack/solutions/security/plugins/lists/public/**/*.{js,mjs,ts,tsx}',
        'x-pack/solutions/security/plugins/lists/common/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        'import/no-nodejs-modules': 'error',
        'no-restricted-imports': [
          'error',
          {
            // prevents UI code from importing server side code and then webpack including it when doing builds
            patterns: ['**/server/*'],
            paths: RESTRICTED_IMPORTS,
          },
        ],
      },
    },
    {
      // typescript for /public and /common
      files: [
        'x-pack/solutions/security/plugins/lists/public/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/lists/common/*.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-for-in-array': 'error',
      },
    },
    {
      // typescript for /public and /common
      files: [
        'x-pack/solutions/security/plugins/lists/public/*.{ts,tsx}',
        'x-pack/solutions/security/plugins/lists/common/*.{ts,tsx}',
      ],
      plugins: ['react'],
      env: {
        jest: true,
      },
      rules: {
        'react/boolean-prop-naming': 'error',
        'react/button-has-type': 'error',
        'react/display-name': 'error',
        'react/forbid-dom-props': 'error',
        'react/no-access-state-in-setstate': 'error',
        'react/no-children-prop': 'error',
        'react/no-danger-with-children': 'error',
        'react/no-deprecated': 'error',
        'react/no-did-mount-set-state': 'error',
        'react/no-did-update-set-state': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-redundant-should-component-update': 'error',
        'react/no-render-return-value': 'error',
        'react/no-typos': 'error',
        'react/no-string-refs': 'error',
        'react/no-this-in-sfc': 'error',
        'react/no-unescaped-entities': 'error',
        'react/no-unsafe': 'error',
        'react/no-unused-prop-types': 'error',
        'react/no-unused-state': 'error',
        'react/sort-comp': 'error',
        'react/sort-default-props': 'error',
        'react/void-dom-elements-no-children': 'error',
        'react/jsx-no-comment-textnodes': 'error',
        'react/jsx-no-literals': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-fragments': 'error',
      },
    },
    {
      files: [
        'src/platform/test/{accessibility,*functional*}/apps/**/*.{js,ts}',
        'src/platform/test/*api_integration*/**/*.{js,ts}',
        'x-pack/test/{accessibility,*functional*}/apps/**/*.{js,ts}',
        'x-pack/test/*api_integration*/**/*.{js,ts}',
        'x-pack/test_serverless/{functional,api_integration}/test_suites/**/*.{js,ts}',
      ],
      extends: ['plugin:mocha/recommended'],
      plugins: ['mocha'],
      env: {
        mocha: true,
      },
      rules: {
        'mocha/no-mocha-arrows': 'off',
        'mocha/no-exports': 'off',
        'mocha/no-setup-in-describe': 'off',
        'mocha/no-nested-tests': 'off',
        'mocha/no-skipped-tests': 'off',
      },
    },
    {
      files: [
        'src/platform/packages/shared/kbn-scout/src/playwright/**/*.ts',
        'x-pack/solutions/observability/packages/kbn-scout-oblt/src/playwright/**/*.ts',
        'x-pack/solutions/security/packages/kbn-scout-security/src/playwright/**/*.ts',
        'src/platform/plugins/**/test/scout/**/*.ts',
        'x-pack/platform/plugins/**/test/scout/**/*.ts',
        'x-pack/solutions/**/plugins/**/test/scout/**/*.ts',
      ],
      excludedFiles: ['src/platform/packages/shared/kbn-scout/src/playwright/**/*.test.ts'],
      extends: ['plugin:playwright/recommended'],
      plugins: ['playwright'],
      settings: {
        playwright: {
          globalAliases: {
            test: ['test', 'spaceTest', 'apiTest'],
          },
        },
      },
      rules: {
        'playwright/no-commented-out-tests': 'error',
        'playwright/no-conditional-expect': 'error',
        'playwright/no-conditional-in-test': 'warn',
        'playwright/no-duplicate-hooks': 'error',
        'playwright/no-focused-test': 'error',
        'playwright/no-get-by-title': 'error',
        'playwright/no-nth-methods': 'error',
        'playwright/no-page-pause': 'error',
        'playwright/no-restricted-matchers': 'error',
        'playwright/no-slowed-test': 'error',
        'playwright/no-standalone-expect': 'error',
        'playwright/no-unsafe-references': 'error',
        'playwright/no-useless-await': 'error',
        'playwright/no-wait-for-selector': 'error',
        'playwright/max-nested-describe': ['error', { max: 1 }],
        'playwright/missing-playwright-await': 'error',
        'playwright/prefer-comparison-matcher': 'error',
        'playwright/prefer-equality-matcher': 'error',
        'playwright/prefer-hooks-in-order': 'error',
        'playwright/prefer-hooks-on-top': 'error',
        'playwright/prefer-strict-equal': 'error',
        'playwright/prefer-to-be': 'error',
        'playwright/prefer-to-contain': 'error',
        'playwright/prefer-to-have-count': 'error',
        'playwright/prefer-to-have-length': 'error',
        'playwright/prefer-web-first-assertions': 'error',
        'playwright/require-to-throw-message': 'error',
        'playwright/require-top-level-describe': 'error',
      },
    },
    {
      files: ['x-pack/solutions/security/plugins/lists/public/**/!(*.test).{js,mjs,ts,tsx}'],
      plugins: ['react-perf'],
      rules: {
        'react-perf/jsx-no-new-object-as-prop': 'error',
        'react-perf/jsx-no-new-array-as-prop': 'error',
        'react-perf/jsx-no-new-function-as-prop': 'error',
        'react/jsx-no-bind': 'error',
      },
    },
    {
      // typescript and javascript for front and back
      files: ['x-pack/solutions/security/plugins/lists/**/*.{js,mjs,ts,tsx}'],
      plugins: ['eslint-plugin-node'],
      env: {
        jest: true,
      },
      rules: {
        'accessor-pairs': 'error',
        'array-callback-return': 'error',
        'no-array-constructor': 'error',
        complexity: 'error',
        'consistent-return': 'error',
        'func-style': ['error', 'expression'],
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
          },
        ],
        'sort-imports': [
          'error',
          {
            ignoreDeclarationSort: true,
          },
        ],
        'node/no-deprecated-api': 'error',
        'no-bitwise': 'error',
        'no-continue': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-ex-assign': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-boolean-cast': 'error',
        'no-extra-label': 'error',
        'no-func-assign': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-invalid-regexp': 'error',
        'no-inner-declarations': 'error',
        'no-lone-blocks': 'error',
        'no-multi-assign': 'error',
        'no-misleading-character-class': 'error',
        'no-new-symbol': 'error',
        'no-obj-calls': 'error',
        'no-param-reassign': ['error', { props: true }],
        'no-process-exit': 'error',
        'no-prototype-builtins': 'error',
        'no-return-await': 'error',
        'no-self-compare': 'error',
        'no-shadow-restricted-names': 'error',
        'no-sparse-arrays': 'error',
        'no-this-before-super': 'error',
        // rely on typescript
        'no-undef': 'off',
        'no-unreachable': 'error',
        'no-unsafe-finally': 'error',
        'no-useless-call': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-escape': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-void': 'error',
        'one-var-declaration-per-line': 'error',
        'prefer-object-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'require-atomic-updates': 'error',
        'symbol-description': 'error',
        'vars-on-top': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/unified-signatures': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-template-curly-in-string': 'error',
        'sort-keys': 'error',
        'prefer-destructuring': 'error',
        'no-restricted-imports': [
          'error',
          {
            // prevents code from importing files that contain the name "legacy" within their name. This is a mechanism
            // to help deprecation and prevent accidental re-use/continued use of code we plan on removing. If you are
            // finding yourself turning this off a lot for "new code" consider renaming the file and functions if it has valid uses.
            patterns: ['*legacy*'],
            paths: RESTRICTED_IMPORTS,
          },
        ],
      },
    },

    /**
     * Alerting Services overrides
     */
    {
      // typescript for front and back end
      files: [
        'x-pack/platform/plugins/shared/actions/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/alerting/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/stack_alerts/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/task_manager/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/event_log/**/*.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    {
      // typescript only for back end
      files: [
        'x-pack/platform/plugins/shared/stack_connectors/server/**/*.ts',
        'x-pack/platform/plugins/shared/triggers_actions_ui/server/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    /**
     * ResponseOps overrides
     */
    {
      files: [
        'src/platform/packages/shared/response-ops/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/alerting/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/actions/**/*.{ts,tsx}',
        'x-pack/platform/plugins/shared/stack_alerts/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/stack_connectors/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/triggers_actions_ui/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/event_log/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/rule_registry/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/task_manager/**/*.{ts, tsx}',
        'x-pack/solutions/observability/packages/kbn-alerts-grouping/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-alerts-ui-shared/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-alerting-types/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-cases-components/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-actions-types/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-alerts-as-data-utils/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-grouping/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-rrule/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-rule-data-utils/**/*.{ts, tsx}',
        'src/platform/packages/shared/kbn-triggers-actions-ui-types/**/*.{ts, tsx}',
        'x-pack/platform/packages/shared/kbn-alerting-comparators/**/*.{ts, tsx}',
        'x-pack/platform/plugins/shared/embeddable_alerts_table/**/*.{ts,tsx}',
        'x-pack/platform/test/alerting_api_integration/**/*.{ts, tsx}',
        'x-pack/platform/test/cases_api_integration/**/*.{ts, tsx}',
        'x-pack/solutions/**/test/cases_api_integration/**/*.{ts, tsx}',
        'x-pack/platform/test/rule_registry/**/*.{ts, tsx}',
        'x-pack/test/api_integration/apis/cases/**/*.{ts, tsx}',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },

    /**
     * Lens overrides
     */
    {
      files: ['x-pack/platform/plugins/shared/lens/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },

    /**
     * Discover overrides
     */
    {
      files: [
        'src/platform/plugins/shared/discover/**/*.{js,mjs,ts,tsx}',
        'src/platform/plugins/shared/saved_search/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': false,
          },
        ],
      },
    },

    /**
     * Enterprise Search overrides
     * NOTE: We also have a single rule at the bottom of the file that
     * overrides Prettier's default of not linting unnecessary backticks
     */
    {
      // All files
      files: ['x-pack/solutions/search/plugins/enterprise_search/**/*.{ts,tsx}'],
      rules: {
        'import/order': [
          'error',
          {
            groups: ['unknown', ['builtin', 'external'], 'internal', 'parent', 'sibling', 'index'],
            pathGroups: [
              {
                pattern:
                  '{../../../../../../,../../../../../,../../../../,../../../,../../,../,./}{common/,*}__mocks__{*,/**}',
                group: 'unknown',
              },
              {
                pattern: '{**,.}/*.mock',
                group: 'unknown',
              },
              {
                pattern: 'react*',
                group: 'external',
                position: 'before',
              },
              {
                pattern: '{@elastic/**,@kbn/**,src/**}',
                group: 'internal',
              },
            ],
            pathGroupsExcludedImportTypes: [],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
            'newlines-between': 'always-and-inside-groups',
          },
        ],
        'import/newline-after-import': 'error',
        'react-hooks/exhaustive-deps': 'off',
        'react/jsx-boolean-value': ['error', 'never'],
        'sort-keys': 1, // warning
        '@typescript-eslint/member-ordering': [1, { default: { order: 'alphabetically' } }], // warning
        '@typescript-eslint/no-unused-vars': [
          'error',
          { vars: 'all', args: 'after-used', ignoreRestSiblings: true, varsIgnorePattern: '^_' },
        ],
        '@kbn/i18n/strings_should_be_translated_with_i18n': 'warn',
        '@kbn/i18n/strings_should_be_translated_with_formatted_message': 'warn',
        '@kbn/telemetry/event_generating_elements_should_be_instrumented': 'warn',
      },
    },
    /**
     * Allows snake_case variables in the server, because that's how we return API properties
     */
    {
      files: ['x-pack/solutions/search/plugins/enterprise_search/server/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            modifiers: ['destructured'],
            format: null,
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
        ],
      },
    },
    {
      // Source files only - allow `any` in test/mock files
      files: ['x-pack/solutions/search/plugins/enterprise_search/**/*.{ts,tsx}'],
      excludedFiles: [
        'x-pack/solutions/search/plugins/enterprise_search/**/*.{test,mock,test_helper}.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },

    /**
     * Serverless Search overrides
     */
    {
      // All files
      files: [
        'x-pack/solutions/search/plugins/serverless_search/**/*.{ts,tsx}',
        'x-pack/solutions/search/packages/kbn-search-*',
      ],
      rules: {
        '@kbn/telemetry/event_generating_elements_should_be_instrumented': 'error',
      },
    },

    /**
     * Canvas overrides
     */
    {
      files: ['x-pack/platform/plugins/private/canvas/**/*.js'],
      rules: {
        radix: 'error',

        // module importing
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          },
        ],
        'import/extensions': ['error', 'never', { json: 'always', less: 'always', svg: 'always' }],

        // react
        'react/no-did-mount-set-state': 'error',
        'react/no-did-update-set-state': 'error',
        'react/no-multi-comp': ['error', { ignoreStateless: true }],
        'react/self-closing-comp': 'error',
        'react/sort-comp': 'error',
        'react/jsx-boolean-value': 'error',
        'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
        'react/forbid-elements': [
          'error',
          {
            forbid: [
              {
                element: 'EuiConfirmModal',
                message: 'Use <ConfirmModal> instead',
              },
              {
                element: 'EuiPopover',
                message: 'Use <Popover> instead',
              },
              {
                element: 'EuiIconTip',
                message: 'Use <TooltipIcon> instead',
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        'x-pack/platform/plugins/private/canvas/gulpfile.js',
        'x-pack/platform/plugins/private/canvas/scripts/*.js',
        'x-pack/platform/plugins/private/canvas/tasks/*.js',
        'x-pack/platform/plugins/private/canvas/tasks/**/*.js',
        'x-pack/platform/plugins/private/canvas/__tests__/**/*.js',
        'x-pack/platform/plugins/private/canvas/**/{__tests__,__test__,__jest__,__fixtures__,__mocks__}/**/*.js',
      ],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
            peerDependencies: true,
            packageDir: '.',
          },
        ],
      },
    },
    {
      files: ['x-pack/platform/plugins/private/canvas/canvas_plugin_src/**/*.js'],
      globals: { canvas: true, $: true },
    },
    {
      files: ['x-pack/platform/plugins/private/canvas/public/**/*.js'],
      env: {
        browser: true,
      },
    },
    {
      files: ['src/platform/packages/shared/kbn-flot-charts/lib/**/*.js'],
      env: {
        jquery: true,
      },
    },

    /**
     * TSVB overrides
     */
    {
      files: ['src/platform/plugins/shared/vis_types/timeseries/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'import/no-default-export': 'error',
      },
    },

    /**
     * Osquery overrides
     */
    {
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['react', '@typescript-eslint'],
      files: ['x-pack/platform/plugins/shared/osquery/**/*.{js,mjs,ts,tsx}'],
      rules: {
        'padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: ['block-like'],
            next: ['*'],
          },
          {
            blankLine: 'always',
            prev: ['*'],
            next: ['return'],
          },
        ],
        'padded-blocks': ['error', 'always'],
        'arrow-body-style': ['error', 'as-needed'],
        'prefer-arrow-callback': 'error',
        'no-unused-vars': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      // typescript and javascript for front end react performance
      files: ['x-pack/platform/plugins/shared/osquery/public/**/!(*.test).{js,mjs,ts,tsx}'],
      plugins: ['react', 'react-perf'],
      rules: {
        'react-perf/jsx-no-new-object-as-prop': 'error',
        'react-perf/jsx-no-new-array-as-prop': 'error',
        'react-perf/jsx-no-new-function-as-prop': 'error',
        'react/jsx-no-bind': 'error',
      },
    },

    /**
     * Platform Security Team overrides
     */
    {
      files: [
        'src/platform/plugins/private/interactive_setup/**/*.{js,mjs,ts,tsx}',
        'src/platform/test/interactive_setup_api_integration/**/*.{js,mjs,ts,tsx}',
        'src/platform/test/interactive_setup_functional/**/*.{js,mjs,ts,tsx}',

        'packages/kbn-mock-idp-plugin/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/private/kbn-mock-idp-utils/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/shared/kbn-security-hardening/**/*.{js,mjs,ts,tsx}',
        'src/platform/packages/shared/kbn-user-profile-components/**/*.{js,mjs,ts,tsx}',

        'x-pack/platform/plugins/shared/encrypted_saved_objects/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/test/encrypted_saved_objects_api_integration/**/*.{js,mjs,ts,tsx}',

        'x-pack/platform/plugins/shared/security/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/private/security/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/packages/shared/security/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/test/security_api_integration/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/test/security_functional/**/*.{js,mjs,ts,tsx}',

        'x-pack/platform/plugins/shared/spaces/**/*.{js,mjs,ts,tsx}',
        'x-pack/platform/test/spaces_api_integration/**/*.{js,mjs,ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 1,
        'import/order': [
          // This rule sorts import declarations
          'error',
          {
            groups: [
              'unknown',
              ['builtin', 'external'],
              'internal',
              ['parent', 'sibling', 'index'],
            ],
            pathGroups: [
              {
                pattern: '{**,.}/*.test.mocks',
                group: 'unknown',
              },
              {
                pattern: '{@kbn/**,src/**,kibana{,/**}}',
                group: 'internal',
              },
            ],
            pathGroupsExcludedImportTypes: [],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
            'newlines-between': 'always',
          },
        ],
        'import/no-duplicates': ['error'],
        'sort-imports': [
          // This rule sorts imports of multiple members (destructured imports)
          'error',
          {
            ignoreCase: true,
            ignoreDeclarationSort: true,
          },
        ],
      },
    },

    /**
     * Do not allow `any`
     */
    {
      files: [
        'src/platform/packages/shared/kbn-analytics/**',
        'src/platform/plugins/private/kibana_usage_collection/**',
        'src/platform/plugins/shared/usage_collection/**',
        'src/platform/plugins/shared/telemetry/**',
        'src/platform/plugins/shared/telemetry_collection_manager/**',
        'src/platform/plugins/shared/telemetry_management_section/**',
        'x-pack/platform/plugins/private/telemetry_collection_xpack/**',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    {
      files: [
        // core-team owned code
        'src/core/**',
        'x-pack/platform/plugins/shared/features/**',
        'x-pack/platform/plugins/shared/licensing/**',
        'x-pack/platform/plugins/shared/global_search/**',
        'x-pack/platform/plugins/shared/cloud/**',
        'src/platform/packages/shared/kbn-config-schema',
        'src/platform/plugins/shared/saved_objects_management/**',
        'src/platform/packages/shared/kbn-analytics/**',
        'src/platform/packages/private/kbn-telemetry-tools/**',
        'src/platform/plugins/private/kibana_usage_collection/**',
        'src/platform/plugins/shared/usage_collection/**',
        'src/platform/plugins/shared/telemetry/**',
        'src/platform/plugins/shared/telemetry_collection_manager/**',
        'src/platform/plugins/shared/telemetry_management_section/**',
        'x-pack/platform/plugins/private/telemetry_collection_xpack/**',
      ],
      rules: {
        '@typescript-eslint/prefer-ts-expect-error': 'error',
      },
    },

    /**
     * Disallow `export *` syntax in plugin/core public/server/common index files and instead
     * require that plugins/core explicitly export the APIs that should be accessible outside the plugin.
     *
     * To add your plugin to this list just update the relevant glob with the name of your plugin
     */
    {
      files: [
        'src/core/{server,public,common}/index.ts',
        'src/platform/plugins/**/{server,public,common}/index.ts',
        'x-pack/platform/plugins/**/{server,public,common}/index.ts',
        'x-pack/solutions/*/plugins/**/{server,public,common}/index.ts',
      ],
      rules: {
        '@kbn/eslint/no_export_all': 'error',
      },
    },

    /**
     * Enterprise Search Prettier override
     * Lints unnecessary backticks - @see https://github.com/prettier/eslint-config-prettier/blob/main/README.md#forbid-unnecessary-backticks
     */
    {
      files: ['x-pack/solutions/search/plugins/enterprise_search/**/*.{ts,tsx}'],
      rules: {
        quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      },
    },

    /**
     * Cloud Security Team overrides
     */
    {
      files: ['x-pack/solutions/security/plugins/cloud_security_posture/**/*.{js,mjs,ts,tsx}'],
      plugins: ['testing-library'],
      rules: {
        'testing-library/await-async-utils': 'error',
      },
    },
    /**
     * Code inside .buildkite runs separately from everything else in CI, before bootstrap, with ts-node. It needs a few tweaks because of this.
     */
    {
      files: '.buildkite/**/*.{js,ts}',
      rules: {
        'no-console': 'off',
        '@kbn/imports/no_unresolvable_imports': 'off',
      },
    },

    /**
     * Code inside .buildkite runs separately from everything else in CI, before bootstrap, with ts-node. It needs a few tweaks because of this.
     */
    {
      files: [
        'src/platform/packages/*/kbn-repo-*/**/*',
        'packages/kbn-repo-*/**/*',
        'packages/kbn-validate-next-docs-cli/**/*',
        'packages/kbn-find-used-node-modules/**/*',
      ],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
    {
      files: [
        // TODO @kibana/operations
        'scripts/create_observability_rules.js', // is importing "@kbn/observability-alerting-test-data" (observability/private)
        'src/cli_setup/**', // is importing "@kbn/interactive-setup-plugin" (platform/private)
        'src/dev/build/tasks/install_chromium.ts', // is importing "@kbn/screenshotting-plugin" (platform/private)

        // FIXME PhilippeOberti @kbn/timelines-plugin depends on security-solution-plugin (security/private) (timelines is going to disappear)
        'x-pack/platform/plugins/shared/timelines/**',

        // For now, we keep the exception to let tests depend on anythying.
        // Ideally, we need to classify the solution specific ones to reduce CI times
        'x-pack/test_serverless/**',
        'x-pack/test/**',
        'x-pack/platform/test/plugin_functional/plugins/resolver_test/**',
      ],
      rules: {
        '@kbn/imports/no_group_crossing_manifests': 'warn',
        '@kbn/imports/no_group_crossing_imports': 'warn',
      },
    },
    {
      files: ['packages/kbn-dependency-usage/**/*.{ts,tsx}'],
      rules: {
        // disabling it since package is a CLI tool
        'no-console': 'off',
        // disabling it since package is marked as module and it requires extension for files written
        '@kbn/imports/uniform_imports': 'off',
      },
    },
    {
      files: ['packages/kbn-dependency-ownership/**/*.{ts,tsx}'],
      rules: {
        // disabling it since package is a CLI tool
        'no-console': 'off',
      },
    },
    {
      files: ['x-pack/**/cypress/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@kbn/cypress-test-helper',
                message:
                  "Import from a sub-path (e.g. '@kbn/cypress-test-helper/src/utils'). Cypress uses Webpack, which requires direct file imports to avoid parse errors.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        'src/platform/plugins/**/test/scout/**/*.ts',
        'x-pack/platform/**/plugins/**/test/scout/**/*.ts',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@playwright/test',
                message: "Platform tests should import only from '@kbn/scout'.",
              },
              {
                name: 'playwright',
                message: "Platform tests should import only from '@kbn/scout'.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ['x-pack/solutions/observability/plugins/**/test/scout/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@kbn/scout',
                message:
                  "Observability solution tests should import from '@kbn/scout-oblt' instead.",
              },
              {
                name: '@playwright/test',
                message:
                  "Observability solution tests should import from '@kbn/scout-oblt' instead.",
              },
              {
                name: 'playwright',
                message:
                  "Observability solution tests should import from '@kbn/scout-oblt' instead.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ['x-pack/solutions/security/plugins/**/test/scout/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@kbn/scout',
                message:
                  "Security solution tests should import from '@kbn/scout-security' instead.",
              },
              {
                name: '@playwright/test',
                message:
                  "Security solution tests should import from '@kbn/scout-security' instead.",
              },
              {
                name: 'playwright',
                message:
                  "Security solution tests should import from '@kbn/scout-security' instead.",
              },
            ],
          },
        ],
      },
    },
  ],
};

/**
 * Prettier disables all conflicting rules, listing as last override so it takes precedence
 * people kept ignoring that this was last so it's now defined outside of the overrides list
 */
/** eslint-disable-next-line */
module.exports.overrides.push({ files: ['**/*'], rules: require('eslint-config-prettier').rules });
/** PLEASE DON'T PUT THINGS AFTER THIS */
