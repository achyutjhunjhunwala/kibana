/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import React, { ReactNode } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiCode, EuiLink } from '@elastic/eui';

import { documentationService } from '../../../../services';
import { stringifyValueDescription } from './stringify_value_description';
import { LicenseType } from '../../../../../types';

import {
  Append,
  Attachment,
  Bytes,
  Circle,
  CommunityId,
  Convert,
  CSV,
  DateProcessor,
  DateIndexName,
  Dissect,
  DotExpander,
  Drop,
  Enrich,
  Fail,
  Fingerprint,
  Foreach,
  GeoGrid,
  GeoIP,
  IpLocation,
  Grok,
  Gsub,
  HtmlStrip,
  Inference,
  Join,
  Json,
  Kv,
  Lowercase,
  NetworkDirection,
  Pipeline,
  Redact,
  RegisteredDomain,
  Remove,
  Rename,
  Script,
  SetProcessor,
  SetSecurityUser,
  Split,
  Sort,
  Trim,
  Uppercase,
  UrlDecode,
  UserAgent,
  FormFieldsComponent,
  UriParts,
  Reroute,
} from '../processor_form/processors';

const processorCategories = {
  DATA_ENRICHMENT: i18n.translate('xpack.ingestPipelines.processors.category.dataEnrichment', {
    defaultMessage: 'Data enrichment',
  }),
  DATA_TRANSFORMATION: i18n.translate(
    'xpack.ingestPipelines.processors.category.dataTransformation',
    {
      defaultMessage: 'Data transformation',
    }
  ),
  DATA_FILTERING: i18n.translate('xpack.ingestPipelines.processors.category.dataFiltering', {
    defaultMessage: 'Data filtering',
  }),
  PIPELINE_HANDLING: i18n.translate('xpack.ingestPipelines.processors.category.pipelineHandling', {
    defaultMessage: 'Pipeline handling',
  }),
  ARRAY_JSON_HANDLING: i18n.translate(
    'xpack.ingestPipelines.processors.category.arrayJsonHandling',
    {
      defaultMessage: 'Array/JSON handling',
    }
  ),
};

interface FieldDescriptor {
  FieldsComponent?: FormFieldsComponent;
  docLinkPath: string;
  /**
   * A sentence case label that can be displayed to users
   */
  label: string;
  /**
   * A general description of the processor type
   */
  typeDescription?: string | ((esDocUrl: string) => ReactNode);
  /**
   * Default
   */
  getDefaultDescription: (processorOptions: Record<string, any>) => string | undefined;
  /**
   * Some processors are only available for certain license types
   */
  forLicenseAtLeast?: LicenseType;
  /**
   * Processors are grouped by category in the processors dropdown
   */
  category: string;
}

type MapProcessorTypeToDescriptor = Record<string, FieldDescriptor>;

let map: MapProcessorTypeToDescriptor | undefined;
export const mapProcessorTypeToDescriptor = () => {
  const docLinks = documentationService.getDocLinks();
  if (!docLinks) {
    throw new Error('Doc links is not available');
  }
  if (map) return map;
  map = {
    append: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Append,
      docLinkPath: docLinks.links.ingest.append,
      label: i18n.translate('xpack.ingestPipelines.processors.label.append', {
        defaultMessage: 'Append',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.append', {
        defaultMessage:
          "Appends values to a field's array. If the field contains a single value, the processor first converts it to an array. If the field doesn't exist, the processor creates an array containing the appended values.",
      }),
      getDefaultDescription: ({ field, value }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.append', {
          defaultMessage: 'Appends "{value}" to the "{field}" field',
          values: {
            field,
            value: stringifyValueDescription(value),
          },
        }),
    },
    attachment: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Attachment,
      docLinkPath: docLinks.links.ingest.attachment,
      label: i18n.translate('xpack.ingestPipelines.processors.label.attachment', {
        defaultMessage: 'Attachment',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.attachment', {
        defaultMessage: 'Extract file attachments in common formats (such as PPT, XLS, and PDF).',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.attachment', {
          defaultMessage: 'Extracts attachment from "{field}"',
          values: {
            field,
          },
        }),
    },
    bytes: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Bytes,
      docLinkPath: docLinks.links.ingest.bytes,
      label: i18n.translate('xpack.ingestPipelines.processors.label.bytes', {
        defaultMessage: 'Bytes',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.bytes', {
        defaultMessage:
          'Converts digital storage units to bytes. For example, 1KB becomes 1024 bytes.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.bytes', {
          defaultMessage: 'Converts "{field}" to its value in bytes',
          values: {
            field,
          },
        }),
    },
    circle: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Circle,
      docLinkPath: docLinks.links.ingest.circle,
      label: i18n.translate('xpack.ingestPipelines.processors.label.circle', {
        defaultMessage: 'Circle',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.circle', {
        defaultMessage: 'Converts a circle definition into an approximate polygon.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.circle', {
          defaultMessage: 'Converts a circle definition of "{field}" into an approximate polygon',
          values: {
            field,
          },
        }),
    },
    community_id: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: CommunityId,
      docLinkPath: docLinks.links.ingest.community,
      label: i18n.translate('xpack.ingestPipelines.processors.label.communityId', {
        defaultMessage: 'Community ID',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.communityId', {
        defaultMessage: 'Computes the Community ID for network flow data.',
      }),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.communityId', {
          defaultMessage: 'Computes the Community ID for network flow data.',
        }),
    },
    convert: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Convert,
      docLinkPath: docLinks.links.ingest.convert,
      label: i18n.translate('xpack.ingestPipelines.processors.label.convert', {
        defaultMessage: 'Convert',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.convert', {
        defaultMessage:
          'Converts a field to a different data type. For example, you can convert a string to an long.',
      }),
      getDefaultDescription: ({ field, type }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.convert', {
          defaultMessage: 'Converts "{field}" to type "{type}"',
          values: {
            field,
            type,
          },
        }),
    },
    csv: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: CSV,
      docLinkPath: docLinks.links.ingest.csv,
      label: i18n.translate('xpack.ingestPipelines.processors.label.csv', {
        defaultMessage: 'CSV',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.csv', {
        defaultMessage: 'Extracts field values from CSV data.',
      }),
      getDefaultDescription: ({ field, target_fields: targetFields }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.csv', {
          defaultMessage: 'Extracts CSV values from "{field}" to {target_fields}',
          values: {
            field,
            target_fields: targetFields.map((v: string) => `"${v}"`).join(', '),
          },
        }),
    },
    date: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: DateProcessor,
      docLinkPath: docLinks.links.ingest.date,
      label: i18n.translate('xpack.ingestPipelines.processors.label.date', {
        defaultMessage: 'Date',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.date', {
        defaultMessage: 'Converts a date to a document timestamp.',
      }),
      getDefaultDescription: ({ field, target_field: targetField = '@timestamp' }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.date', {
          defaultMessage: 'Parses a date from "{field}" to a date type on field "{target_field}"',
          values: {
            field,
            target_field: targetField,
          },
        }),
    },
    date_index_name: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: DateIndexName,
      docLinkPath: docLinks.links.ingest.dateIndexName,
      label: i18n.translate('xpack.ingestPipelines.processors.label.dateIndexName', {
        defaultMessage: 'Date index name',
      }),
      typeDescription: () => (
        <FormattedMessage
          id="xpack.ingestPipelines.processors.description.dateIndexName"
          defaultMessage="Uses a date or timestamp to add documents to the correct time-based index. Index names must use a date math pattern, such as {value}."
          values={{ value: <EuiCode>{'my-index-yyyy-MM-dd'}</EuiCode> }}
        />
      ),
      getDefaultDescription: ({ field, index_name_prefix: indexNamePrefix }) => {
        const prefix = indexNamePrefix
          ? i18n.translate(
              'xpack.ingestPipelines.processors.defaultDescription.dateIndexName.indexNamePrefixDefault.prefixValueLabel',
              { defaultMessage: 'with the prefix "{prefix}"', values: { prefix: indexNamePrefix } }
            )
          : i18n.translate(
              'xpack.ingestPipelines.processors.defaultDescription.dateIndexName.indexNamePrefixDefault.noPrefixValueLabel',
              { defaultMessage: 'with no prefix' }
            );
        return i18n.translate(
          'xpack.ingestPipelines.processors.defaultDescription.date_index_name',
          {
            defaultMessage:
              'Adds documents to a time-based index based on the timestamp value in "{field}", {prefix}',
            values: {
              field,
              prefix,
            },
          }
        );
      },
    },
    dissect: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Dissect,
      docLinkPath: docLinks.links.ingest.dissect,
      label: i18n.translate('xpack.ingestPipelines.processors.label.dissect', {
        defaultMessage: 'Dissect',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.dissect', {
        defaultMessage: 'Uses dissect patterns to extract matches from a field.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.dissect', {
          defaultMessage: 'Extracts values from "{field}" that match a dissect pattern',
          values: {
            field,
          },
        }),
    },
    dot_expander: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: DotExpander,
      docLinkPath: docLinks.links.ingest.dotExpander,
      label: i18n.translate('xpack.ingestPipelines.processors.label.dotExpander', {
        defaultMessage: 'Dot expander',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.dotExpander', {
        defaultMessage:
          'Expands a field containing dot notation into an object field. The object field is then accessible by other processors in the pipeline.',
      }),
      getDefaultDescription: ({ field }) => {
        return field === '*'
          ? i18n.translate(
              'xpack.ingestPipelines.processors.defaultDescription.dot_expander.wildcard',
              {
                defaultMessage: 'All top-level fields will be expanded',
              }
            )
          : i18n.translate(
              'xpack.ingestPipelines.processors.defaultDescription.dot_expander.dot_notation',
              {
                defaultMessage: 'Expands "{field}" into an object field',
                values: {
                  field,
                },
              }
            );
      },
    },
    drop: {
      category: processorCategories.DATA_FILTERING,
      FieldsComponent: Drop,
      docLinkPath: docLinks.links.ingest.drop,
      label: i18n.translate('xpack.ingestPipelines.processors.label.drop', {
        defaultMessage: 'Drop',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.drop', {
        defaultMessage: 'Drops documents without returning an error.',
      }),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.drop', {
          defaultMessage: 'Drops documents without returning an error',
        }),
    },
    enrich: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Enrich,
      docLinkPath: docLinks.links.ingest.enrich,
      label: i18n.translate('xpack.ingestPipelines.processors.label.enrich', {
        defaultMessage: 'Enrich',
      }),
      typeDescription: (esDocUrl) => {
        return (
          <FormattedMessage
            id="xpack.ingestPipelines.processors.description.enrich"
            defaultMessage="Adds enrich data to incoming documents based on an {enrichPolicyLink}."
            values={{
              enrichPolicyLink: (
                <EuiLink external target="_blank" href={docLinks.links.ingest.enrich}>
                  {'enrich policy'}
                </EuiLink>
              ),
            }}
          />
        );
      },
      getDefaultDescription: ({ field, policy_name: policyName, target_field: targetField }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.enrich', {
          defaultMessage:
            'Enriches data to "{target_field}" if the "{policy_name}" policy matches "{field}"',
          values: {
            field,
            policy_name: policyName,
            target_field: targetField,
          },
        }),
    },
    fail: {
      category: processorCategories.PIPELINE_HANDLING,
      FieldsComponent: Fail,
      docLinkPath: docLinks.links.ingest.fail,
      label: i18n.translate('xpack.ingestPipelines.processors.label.fail', {
        defaultMessage: 'Fail',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.fail', {
        defaultMessage:
          'Returns a custom error message on failure. Often used to notify requesters of required conditions.',
      }),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.fail', {
          defaultMessage: 'Raises an exception that halts execution',
        }),
    },
    fingerprint: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Fingerprint,
      docLinkPath: docLinks.links.fleet.fingerprint,
      label: i18n.translate('xpack.ingestPipelines.processors.label.fingerprint', {
        defaultMessage: 'Fingerprint',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.fingerprint', {
        defaultMessage: 'Computes a hash of the document’s content.',
      }),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.fingerprint', {
          defaultMessage: 'Computes a hash of the document’s content.',
        }),
    },
    foreach: {
      category: processorCategories.ARRAY_JSON_HANDLING,
      FieldsComponent: Foreach,
      docLinkPath: docLinks.links.ingest.foreach,
      label: i18n.translate('xpack.ingestPipelines.processors.label.foreach', {
        defaultMessage: 'Foreach',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.foreach', {
        defaultMessage: 'Applies an ingest processor to each value in an array.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.foreach', {
          defaultMessage: 'Runs a processor for each object in "{field}"',
          values: {
            field,
          },
        }),
    },
    geo_grid: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: GeoGrid,
      docLinkPath: docLinks.links.ingest.geoGrid,
      label: i18n.translate('xpack.ingestPipelines.processors.label.geogrid', {
        defaultMessage: 'GeoGrid',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.geogrid', {
        defaultMessage:
          'Converts geo-grid definitions of grid tiles or cells to regular bounding boxes or polygons which describe their shape.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.geogrid', {
          defaultMessage: 'Adds geo-grid data to documents based on the value of "{field}"',
          values: {
            field,
          },
        }),
    },
    geoip: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: GeoIP,
      docLinkPath: docLinks.links.ingest.geoIp,
      label: i18n.translate('xpack.ingestPipelines.processors.label.geoip', {
        defaultMessage: 'GeoIP',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.geoip', {
        defaultMessage:
          'Adds geo data based on an IP address. Uses geo data from a MaxMind database file.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.geoip', {
          defaultMessage: 'Adds geo data to documents based on the value of "{field}"',
          values: {
            field,
          },
        }),
    },
    ip_location: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: IpLocation,
      docLinkPath: docLinks.links.ingest.ipLocation,
      label: i18n.translate('xpack.ingestPipelines.processors.label.ipLocation', {
        defaultMessage: 'IP Location',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.ipLocation', {
        defaultMessage: 'Adds geo data based on an IP address.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.ipLocation', {
          defaultMessage: 'Adds geo data to documents based on the value of "{field}"',
          values: {
            field,
          },
        }),
    },
    grok: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Grok,
      docLinkPath: docLinks.links.ingest.grok,
      label: i18n.translate('xpack.ingestPipelines.processors.label.grok', {
        defaultMessage: 'Grok',
      }),
      typeDescription: (esDocUrl) => {
        return (
          <FormattedMessage
            id="xpack.ingestPipelines.processors.description.grok"
            defaultMessage="Uses {grokLink} expressions to extract matches from a field."
            values={{
              grokLink: (
                <EuiLink external target="_blank" href={docLinks.links.ingest.grok}>
                  {'grok'}
                </EuiLink>
              ),
            }}
          />
        );
      },
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.grok', {
          defaultMessage: 'Extracts values from "{field}" that match a grok pattern',
          values: {
            field,
          },
        }),
    },
    gsub: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Gsub,
      docLinkPath: docLinks.links.ingest.gsub,
      label: i18n.translate('xpack.ingestPipelines.processors.label.gsub', {
        defaultMessage: 'Gsub',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.gsub', {
        defaultMessage: 'Uses a regular expression to replace field substrings.',
      }),
      getDefaultDescription: ({ pattern, field, replacement }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.gsub', {
          defaultMessage: 'Replaces values matching "{pattern}" in "{field}" with "{replacement}"',
          values: {
            pattern,
            field,
            replacement,
          },
        }),
    },
    html_strip: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: HtmlStrip,
      docLinkPath: docLinks.links.ingest.htmlString,
      label: i18n.translate('xpack.ingestPipelines.processors.label.htmlStrip', {
        defaultMessage: 'HTML strip',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.htmlStrip', {
        defaultMessage: 'Removes HTML tags from a field.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.html_strip', {
          defaultMessage: 'Removes HTML tags from "{field}"',
          values: {
            field,
          },
        }),
    },
    inference: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: Inference,
      docLinkPath: docLinks.links.ingest.inference,
      label: i18n.translate('xpack.ingestPipelines.processors.label.inference', {
        defaultMessage: 'Inference',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.inference', {
        defaultMessage:
          'Uses an inference endpoint or a trained model to infer against incoming data.',
      }),
      getDefaultDescription: ({
        model_id: modelId,
        target_field: targetField = 'ml.inference.<processor_tag>',
      }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.inference', {
          defaultMessage: 'Runs the model "{modelId}" and stores the result in "{target_field}"',
          values: {
            modelId,
            target_field: targetField,
          },
        }),
    },
    join: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Join,
      docLinkPath: docLinks.links.ingest.join,
      label: i18n.translate('xpack.ingestPipelines.processors.label.join', {
        defaultMessage: 'Join',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.join', {
        defaultMessage:
          'Joins array elements into a string. Inserts a separator between each element.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.join', {
          defaultMessage: 'Joins each element of the array stored in "{field}"',
          values: {
            field,
          },
        }),
    },
    json: {
      category: processorCategories.ARRAY_JSON_HANDLING,
      FieldsComponent: Json,
      docLinkPath: docLinks.links.ingest.json,
      label: i18n.translate('xpack.ingestPipelines.processors.label.json', {
        defaultMessage: 'JSON',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.json', {
        defaultMessage: 'Creates a JSON object from a compatible string.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.json', {
          defaultMessage: 'Parses "{field}" to create a JSON object from a string',
          values: {
            field,
          },
        }),
    },
    kv: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Kv,
      docLinkPath: docLinks.links.ingest.kv,
      label: i18n.translate('xpack.ingestPipelines.processors.label.kv', {
        defaultMessage: 'Key-value (KV)',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.kv', {
        defaultMessage: 'Extracts fields from a string containing key-value pairs.',
      }),
      getDefaultDescription: ({ field, field_split: fieldSplit, value_split: valueSplit }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.kv', {
          defaultMessage:
            'Extracts key-value pairs from "{field}" and splits on "{field_split}" and "{value_split}"',
          values: {
            field,
            field_split: fieldSplit,
            value_split: valueSplit,
          },
        }),
    },
    lowercase: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Lowercase,
      docLinkPath: docLinks.links.ingest.lowercase,
      label: i18n.translate('xpack.ingestPipelines.processors.label.lowercase', {
        defaultMessage: 'Lowercase',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.lowercase', {
        defaultMessage: 'Converts a string to lowercase.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.lowercase', {
          defaultMessage: 'Converts values in "{field}" to lowercase',
          values: {
            field,
          },
        }),
    },
    network_direction: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: NetworkDirection,
      docLinkPath: docLinks.links.ingest.network,
      label: i18n.translate('xpack.ingestPipelines.processors.label.networkDirection', {
        defaultMessage: 'Network Direction',
      }),
      typeDescription: i18n.translate(
        'xpack.ingestPipelines.processors.description.networkDirection',
        {
          defaultMessage: 'Calculates the network direction given a source IP address.',
        }
      ),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.networkDirection', {
          defaultMessage: 'Calculates the network direction given a source IP address.',
        }),
    },
    pipeline: {
      category: processorCategories.PIPELINE_HANDLING,
      FieldsComponent: Pipeline,
      docLinkPath: docLinks.links.ingest.pipeline,
      label: i18n.translate('xpack.ingestPipelines.processors.label.pipeline', {
        defaultMessage: 'Pipeline',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.pipeline', {
        defaultMessage: 'Runs another ingest pipeline.',
      }),
      getDefaultDescription: ({ name }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.pipeline', {
          defaultMessage: 'Runs the "{name}" ingest pipeline',
          values: {
            name,
          },
        }),
    },
    redact: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Redact,
      forLicenseAtLeast: 'platinum',
      docLinkPath: docLinks.links.ingest.redact,
      label: i18n.translate('xpack.ingestPipelines.processors.label.redact', {
        defaultMessage: 'Redact',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.redact', {
        defaultMessage:
          'The Redact processor uses the Grok rules engine to obscure text in the input document matching the given Grok patterns.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.redact', {
          defaultMessage: 'Redact values from "{field}" that match a grok pattern',
          values: {
            field,
          },
        }),
    },
    registered_domain: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: RegisteredDomain,
      docLinkPath: docLinks.links.ingest.registeredDomain,
      label: i18n.translate('xpack.ingestPipelines.processors.label.registeredDomain', {
        defaultMessage: 'Registered domain',
      }),
      typeDescription: i18n.translate(
        'xpack.ingestPipelines.processors.description.registeredDomain',
        {
          defaultMessage:
            'Extracts the registered domain (effective top-level domain), sub-domain, and top-level domain from a fully qualified domain name.',
        }
      ),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.registeredDomain', {
          defaultMessage:
            'Extracts the registered domain, sub-domain, and top-level domain from "{field}"',
          values: {
            field,
          },
        }),
    },
    remove: {
      category: processorCategories.DATA_FILTERING,
      FieldsComponent: Remove,
      docLinkPath: docLinks.links.ingest.remove,
      label: i18n.translate('xpack.ingestPipelines.processors.label.remove', {
        defaultMessage: 'Remove',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.remove', {
        defaultMessage: 'Removes one or more fields.',
      }),
      getDefaultDescription: ({ field, keep }) => {
        if (keep) {
          return i18n.translate('xpack.ingestPipelines.processors.defaultDescription.removeKeep', {
            defaultMessage: 'Keeps only "{keep}"',
            values: {
              keep: Array.isArray(keep) ? keep.map((v) => `"${v}"`).join(', ') : keep,
            },
          });
        }
        return i18n.translate('xpack.ingestPipelines.processors.defaultDescription.remove', {
          defaultMessage: 'Removes "{field}"',
          values: {
            field: Array.isArray(field) ? field.map((v) => `"${v}"`).join(', ') : field,
          },
        });
      },
    },
    rename: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Rename,
      docLinkPath: docLinks.links.ingest.rename,
      label: i18n.translate('xpack.ingestPipelines.processors.label.rename', {
        defaultMessage: 'Rename',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.rename', {
        defaultMessage: 'Renames an existing field.',
      }),
      getDefaultDescription: ({ field, target_field: targetField }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.rename', {
          defaultMessage: 'Renames "{field}" to "{target_field}"',
          values: {
            field,
            target_field: targetField,
          },
        }),
    },
    reroute: {
      category: processorCategories.PIPELINE_HANDLING,
      FieldsComponent: Reroute,
      docLinkPath: docLinks.links.ingest.reroute,
      label: i18n.translate('xpack.ingestPipelines.processors.label.reroute', {
        defaultMessage: 'Reroute',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.reroute', {
        defaultMessage: 'Routes a document to another target index or data stream.',
      }),
      getDefaultDescription: ({ field, target_field: targetField }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.reroute', {
          defaultMessage: 'Routes a document to another target index or data stream',
        }),
    },
    script: {
      category: processorCategories.ARRAY_JSON_HANDLING,
      FieldsComponent: Script,
      docLinkPath: docLinks.links.ingest.script,
      label: i18n.translate('xpack.ingestPipelines.processors.label.script', {
        defaultMessage: 'Script',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.script', {
        defaultMessage: 'Runs a script on incoming documents.',
      }),
      getDefaultDescription: () => 'Runs a script on incoming documents',
    },
    set: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: SetProcessor,
      docLinkPath: docLinks.links.ingest.set,
      label: i18n.translate('xpack.ingestPipelines.processors.label.set', {
        defaultMessage: 'Set',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.set', {
        defaultMessage: 'Sets the value of a field.',
      }),
      getDefaultDescription: ({ field, value, copy_from: copyFrom }) => {
        if (copyFrom) {
          return i18n.translate('xpack.ingestPipelines.processors.defaultDescription.setCopyFrom', {
            defaultMessage: 'Sets value of "{field}" to the value of "{copyFrom}"',
            values: {
              field,
              copyFrom,
            },
          });
        }

        return i18n.translate('xpack.ingestPipelines.processors.defaultDescription.set', {
          defaultMessage: 'Sets value of "{field}" to "{value}"',
          values: {
            field,
            value: stringifyValueDescription(value),
          },
        });
      },
    },
    set_security_user: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: SetSecurityUser,
      docLinkPath: docLinks.links.ingest.setSecurityUser,
      label: i18n.translate('xpack.ingestPipelines.processors.label.setSecurityUser', {
        defaultMessage: 'Set security user',
      }),
      typeDescription: i18n.translate(
        'xpack.ingestPipelines.processors.description.setSecurityUser',
        {
          defaultMessage:
            'Adds details about the current user, such user name and email address, to incoming documents. Requires an authenticated user for the indexing request.',
        }
      ),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.setSecurityUser', {
          defaultMessage: 'Adds details about the current user to "{field}"',
          values: { field },
        }),
    },
    sort: {
      category: processorCategories.ARRAY_JSON_HANDLING,
      FieldsComponent: Sort,
      docLinkPath: docLinks.links.ingest.sort,
      label: i18n.translate('xpack.ingestPipelines.processors.label.sort', {
        defaultMessage: 'Sort',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.sort', {
        defaultMessage: "Sorts a field's array elements.",
      }),
      getDefaultDescription: ({ field, order = 'asc' }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.sort', {
          defaultMessage: 'Sorts elements in the array "{field}" in {order} order',
          values: {
            field,
            order:
              order === 'asc'
                ? i18n.translate(
                    'xpack.ingestPipelines.processors.defaultDescription.sort.orderAscendingLabel',
                    { defaultMessage: 'ascending' }
                  )
                : i18n.translate(
                    'xpack.ingestPipelines.processors.defaultDescription.sort.orderDescendingLabel',
                    { defaultMessage: 'descending' }
                  ),
          },
        }),
    },
    split: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Split,
      docLinkPath: docLinks.links.ingest.split,
      label: i18n.translate('xpack.ingestPipelines.processors.label.split', {
        defaultMessage: 'Split',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.split', {
        defaultMessage: 'Splits a field value into an array.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.split', {
          defaultMessage: 'Splits the string stored in "{field}" to an array',
          values: {
            field,
          },
        }),
    },
    terminate: {
      category: processorCategories.PIPELINE_HANDLING,
      docLinkPath: docLinks.links.ingest.terminate,
      label: i18n.translate('xpack.ingestPipelines.processors.label.terminate', {
        defaultMessage: 'Terminate',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.terminate', {
        defaultMessage:
          'Terminates the current ingest pipeline, causing no further processors to be run.',
      }),
      getDefaultDescription: () =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.terminate', {
          defaultMessage: 'Terminates the current pipeline',
        }),
    },
    trim: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Trim,
      docLinkPath: docLinks.links.ingest.trim,
      label: i18n.translate('xpack.ingestPipelines.processors.label.trim', {
        defaultMessage: 'Trim',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.trim', {
        defaultMessage: 'Removes leading and trailing whitespace from a string.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.trim', {
          defaultMessage: 'Trims whitespaces from "{field}"',
          values: {
            field,
          },
        }),
    },
    uppercase: {
      category: processorCategories.DATA_TRANSFORMATION,
      FieldsComponent: Uppercase,
      docLinkPath: docLinks.links.ingest.uppercase,
      label: i18n.translate('xpack.ingestPipelines.processors.label.uppercase', {
        defaultMessage: 'Uppercase',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.uppercase', {
        defaultMessage: 'Converts a string to uppercase.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.uppercase', {
          defaultMessage: 'Converts values in "{field}" to uppercase',
          values: {
            field,
          },
        }),
    },
    urldecode: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: UrlDecode,
      docLinkPath: docLinks.links.ingest.urlDecode,
      label: i18n.translate('xpack.ingestPipelines.processors.label.urldecode', {
        defaultMessage: 'URL decode',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.urldecode', {
        defaultMessage: 'Decodes a URL-encoded string.',
      }),
      getDefaultDescription: ({ field }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.url_decode', {
          defaultMessage: 'Decodes the URL in "{field}"',
          values: {
            field,
          },
        }),
    },
    uri_parts: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: UriParts,
      docLinkPath: docLinks.links.ingest.uriParts,
      label: i18n.translate('xpack.ingestPipelines.processors.label.uriPartsLabel', {
        defaultMessage: 'URI parts',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.uriPartsDescription', {
        defaultMessage:
          'Parses a Uniform Resource Identifier (URI) string and extracts its components as an object.',
      }),
      getDefaultDescription: ({ field, target_field: targetField = 'url' }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.uri_parts', {
          defaultMessage:
            'Parses the URI string in "{field}" and stores the result in "{target_field}"',
          values: {
            field,
            target_field: targetField,
          },
        }),
    },
    user_agent: {
      category: processorCategories.DATA_ENRICHMENT,
      FieldsComponent: UserAgent,
      docLinkPath: docLinks.links.ingest.userAgent,
      label: i18n.translate('xpack.ingestPipelines.processors.label.userAgent', {
        defaultMessage: 'User agent',
      }),
      typeDescription: i18n.translate('xpack.ingestPipelines.processors.description.userAgent', {
        defaultMessage: "Extracts values from a browser's user agent string.",
      }),
      getDefaultDescription: ({ field, target_field: targetField = 'user_agent' }) =>
        i18n.translate('xpack.ingestPipelines.processors.defaultDescription.user_agent', {
          defaultMessage:
            'Extracts the user agent from "{field}" and stores the results in "{target_field}"',
          values: {
            field,
            target_field: targetField,
          },
        }),
    },
  } satisfies MapProcessorTypeToDescriptor;
  return map;
};

export type ProcessorType = keyof ReturnType<typeof mapProcessorTypeToDescriptor>;

export const getProcessorDescriptor = (
  type: ProcessorType | string
): FieldDescriptor | undefined => {
  return mapProcessorTypeToDescriptor()[type as ProcessorType];
};
