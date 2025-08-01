/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import type { UseEuiTheme } from '@elastic/eui';
import { EuiToolTip } from '@elastic/eui';
import type { AgentName } from '@kbn/elastic-agent-utils';
import { dynamic } from '@kbn/shared-ux-utility';
import type { DataGridCellValueElementProps } from '@kbn/unified-data-table';
import { css } from '@emotion/react';
import {
  formatFieldValue,
  getFieldValue,
  OTEL_RESOURCE_ATTRIBUTES_TELEMETRY_SDK_LANGUAGE,
} from '@kbn/discover-utils';
import { FieldBadgeWithActions } from '@kbn/discover-contextual-components/src/data_types/logs/components/cell_actions_popover';
import { useDiscoverServices } from '../../../hooks/use_discover_services';
import type { CellRenderersExtensionParams } from '../../../context_awareness';
import { AGENT_NAME_FIELD } from '../../../../common/data_types/logs/constants';

const AgentIcon = dynamic(() => import('@kbn/custom-icons/src/components/agent_icon'));
const dataTestSubj = 'serviceNameCell';

const agentIconStyle = ({ euiTheme }: UseEuiTheme) => css`
  margin-right: ${euiTheme.size.xs};
`;

export const getServiceNameCell =
  (serviceNameField: string, { actions }: CellRenderersExtensionParams) =>
  (props: DataGridCellValueElementProps) => {
    const { core, share } = useDiscoverServices();
    const serviceNameValue = getFieldValue(props.row, serviceNameField);
    const field = props.dataView.getFieldByName(serviceNameField);
    const agentName = getFieldValue(props.row, AGENT_NAME_FIELD) as AgentName;
    const otelSdkLanguage = getFieldValue(
      props.row,
      OTEL_RESOURCE_ATTRIBUTES_TELEMETRY_SDK_LANGUAGE
    ) as AgentName | undefined;

    if (!serviceNameValue) {
      return <span data-test-subj={`${dataTestSubj}-empty`}>-</span>;
    }

    const agentNameIcon = otelSdkLanguage || agentName;

    const getIcon = () => (
      <EuiToolTip position="left" content={agentNameIcon} repositionOnScroll={true}>
        <AgentIcon agentName={agentNameIcon} size="m" css={agentIconStyle} />
      </EuiToolTip>
    );

    const value = formatFieldValue(
      serviceNameValue,
      props.row.raw,
      props.fieldFormats,
      props.dataView,
      field,
      'html'
    );

    return (
      <FieldBadgeWithActions
        onFilter={actions.addFilter}
        icon={getIcon}
        rawValue={serviceNameValue}
        value={value}
        name={serviceNameField}
        property={field}
        core={core}
        share={share}
      />
    );
  };
