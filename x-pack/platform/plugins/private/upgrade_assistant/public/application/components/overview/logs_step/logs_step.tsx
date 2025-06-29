/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState, useCallback } from 'react';

import {
  EuiText,
  EuiSpacer,
  EuiButton,
  EuiCallOut,
  EuiSkeletonText,
  EuiCode,
  EuiFlexGroup,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedDate, FormattedTime, FormattedMessage } from '@kbn/i18n-react';
import type { EuiStepProps } from '@elastic/eui/src/components/steps/step';

import {
  DEPRECATION_LOGS_INDEX,
  APP_LOGS_COUNT_CLUSTER_PRIVILEGES,
  APP_LOGS_COUNT_INDEX_PRIVILEGES,
} from '../../../../../common/constants';
import { WithPrivileges, MissingPrivileges, GlobalFlyout } from '../../../../shared_imports';
import { useAppContext } from '../../../app_context';
import { loadLogsCheckpoint } from '../../../lib/logs_checkpoint';
import type { OverviewStepProps } from '../../types';
import { useDeprecationLogging } from '../../es_deprecation_logs';
import { DiscoverExternalLinks } from '../../es_deprecation_logs/fix_deprecation_logs/external_links';
import {
  EsDeprecationLogsFlyout,
  EsDeprecationLogsFlyoutProps,
} from '../../es_deprecation_logs/fix_deprecation_logs/es_deprecation_logs_flyout';

const i18nTexts = {
  logsStepTitle: i18n.translate('xpack.upgradeAssistant.overview.logsStep.title', {
    defaultMessage: 'Address API deprecations',
  }),
  logsStepDescription: i18n.translate('xpack.upgradeAssistant.overview.logsStep.description', {
    defaultMessage: `Review the Elasticsearch deprecation logs to ensure you're not using deprecated APIs.`,
  }),
  viewDetailsButtonLabel: i18n.translate(
    'xpack.upgradeAssistant.overview.logsStep.viewDetailsButtonLabel',
    {
      defaultMessage: 'View details',
    }
  ),
  enableLogsButtonLabel: i18n.translate(
    'xpack.upgradeAssistant.overview.logsStep.enableLogsButtonLabel',
    {
      defaultMessage: 'Enable logging',
    }
  ),
  logsCountDescription: (deprecationCount: number, checkpoint: string) => (
    <FormattedMessage
      id="xpack.upgradeAssistant.overview.logsStep.countDescription"
      defaultMessage="You have {deprecationCount, plural, =0 {no} other {{deprecationCount}}} deprecation {deprecationCount, plural, one {issue} other {issues}} since {checkpoint}."
      values={{
        deprecationCount,
        checkpoint: (
          <>
            <FormattedDate value={checkpoint} year="numeric" month="long" day="2-digit" />{' '}
            <FormattedTime value={checkpoint} timeZoneName="short" hour12={false} />
          </>
        ),
      }}
    />
  ),
  missingIndexPrivilegesTitle: i18n.translate(
    'xpack.upgradeAssistant.overview.logsStep.missingPrivilegesTitle',
    {
      defaultMessage: 'You require index privileges to analyze the deprecation logs',
    }
  ),
  missingIndexPrivilegesDescription: (privilegesMissing: MissingPrivileges) => (
    <FormattedMessage
      id="xpack.upgradeAssistant.overview.logsStep.missingPrivilegesDescription"
      defaultMessage="The deprecation logs will continue to be indexed, but you won't be able to analyze them until you have the {requiredPrivileges} index privileges for: {missingPrivileges}"
      values={{
        requiredPrivileges: <i>{APP_LOGS_COUNT_INDEX_PRIVILEGES.join(', ')}</i>,
        missingPrivileges: (
          <EuiCode transparentBackground={true}>{privilegesMissing?.index?.join(', ')}</EuiCode>
        ),
      }}
    />
  ),
  missingClusterPrivilegesTitle: i18n.translate(
    'xpack.upgradeAssistant.overview.logsStep.missingClusterPrivilegesTitle',
    {
      defaultMessage: 'You require cluster privileges to analyze the deprecation logs',
    }
  ),
  missingClusterPrivilegesDescription: (privilegesMissing: MissingPrivileges) => (
    <FormattedMessage
      id="xpack.upgradeAssistant.overview.logsStep.missingClusterPrivilegesDescription"
      defaultMessage="The deprecation logs will continue to be indexed, but you won't be able to analyze them until you have the cluster {privilegesCount, plural, one {privilege} other {privileges}} for: {missingPrivileges}"
      values={{
        missingPrivileges: (
          <EuiCode transparentBackground={true}>{privilegesMissing?.cluster?.join(', ')}</EuiCode>
        ),
        privilegesCount: privilegesMissing?.cluster?.length,
      }}
    />
  ),
  loadingError: i18n.translate('xpack.upgradeAssistant.overview.logsStep.loadingError', {
    defaultMessage: 'An error occurred while retrieving the deprecation log count',
  }),
  retryButton: i18n.translate('xpack.upgradeAssistant.overview.logsStep.retryButton', {
    defaultMessage: 'Try again',
  }),
};

const FLYOUT_ID = 'deprecationLogsFlyout';
const { useGlobalFlyout } = GlobalFlyout;

interface LogStepProps {
  setIsComplete: (isComplete: boolean) => void;
  hasPrivileges: boolean;
  privilegesMissing: MissingPrivileges;
}

const LogStepDescription = () => (
  <EuiText>
    <p>{i18nTexts.logsStepDescription}</p>
  </EuiText>
);

const LogsStep = ({ setIsComplete, hasPrivileges, privilegesMissing }: LogStepProps) => {
  const {
    services: { api },
  } = useAppContext();

  const { isDeprecationLogIndexingEnabled, resendRequest: refreshDeprecationLogging } =
    useDeprecationLogging();

  const checkpoint = loadLogsCheckpoint();

  const {
    data: logsCount,
    error,
    isLoading,
    resendRequest,
    isInitialRequest,
  } = api.getDeprecationLogsCount(checkpoint);

  useEffect(() => {
    if (!isDeprecationLogIndexingEnabled) {
      setIsComplete(false);
    }

    setIsComplete(logsCount?.count === 0);

    // Depending upon setIsComplete would create an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeprecationLogIndexingEnabled, logsCount]);

  const [showFlyout, setShowFlyout] = useState(false);

  const { addContent: addContentToGlobalFlyout, removeContent: removeContentFromGlobalFlyout } =
    useGlobalFlyout();

  const closeFlyout = useCallback(() => {
    setShowFlyout(false);
    removeContentFromGlobalFlyout(FLYOUT_ID);
  }, [removeContentFromGlobalFlyout]);

  const handleToggleChange = useCallback(() => {
    refreshDeprecationLogging();
  }, [refreshDeprecationLogging]);

  useEffect(() => {
    if (showFlyout) {
      addContentToGlobalFlyout<EsDeprecationLogsFlyoutProps>({
        id: FLYOUT_ID,
        Component: EsDeprecationLogsFlyout,
        props: {
          closeFlyout,
          handleToggleChange,
        },
        flyoutProps: {
          onClose: closeFlyout,
          'data-test-subj': 'esDeprecationLogsFlyout',
          'aria-labelledby': 'esDeprecationLogsFlyoutTitle',
        },
      });
    }
  }, [addContentToGlobalFlyout, closeFlyout, handleToggleChange, showFlyout]);

  if (hasPrivileges === false && isDeprecationLogIndexingEnabled) {
    return (
      <>
        <LogStepDescription />

        <EuiSpacer />

        {privilegesMissing.cluster && (
          <EuiCallOut
            iconType="question"
            color="warning"
            title={i18nTexts.missingClusterPrivilegesTitle}
            data-test-subj="missingClusterPrivilegesCallout"
          >
            <p>{i18nTexts.missingClusterPrivilegesDescription(privilegesMissing)}</p>
          </EuiCallOut>
        )}

        {privilegesMissing.cluster && privilegesMissing.index && <EuiSpacer />}

        {privilegesMissing.index && (
          <EuiCallOut
            iconType="question"
            color="warning"
            title={i18nTexts.missingIndexPrivilegesTitle}
            data-test-subj="missingIndexPrivilegesCallout"
          >
            <p>{i18nTexts.missingIndexPrivilegesDescription(privilegesMissing)}</p>
          </EuiCallOut>
        )}
      </>
    );
  }

  if (isLoading && isInitialRequest) {
    return <EuiSkeletonText lines={3} />;
  }

  if (hasPrivileges && error) {
    return (
      <EuiCallOut
        title={i18nTexts.loadingError}
        color="danger"
        iconType="warning"
        data-test-subj="deprecationLogsErrorCallout"
      >
        <p>
          {error.statusCode} - {error.message as string}
        </p>

        <EuiButton
          color="danger"
          onClick={resendRequest}
          data-test-subj="deprecationLogsRetryButton"
        >
          {i18nTexts.retryButton}
        </EuiButton>
      </EuiCallOut>
    );
  }

  return (
    <>
      <LogStepDescription />

      {isDeprecationLogIndexingEnabled && logsCount ? (
        <>
          <EuiSpacer />

          <EuiText>
            <p data-test-subj="logsCountDescription">
              {i18nTexts.logsCountDescription(logsCount.count, checkpoint)}
            </p>
          </EuiText>

          <EuiSpacer />
          <EuiFlexGroup responsive={false} wrap gutterSize="s" alignItems="center">
            <DiscoverExternalLinks
              checkpoint={checkpoint}
              showInfoParagraph={false}
              isButtonFormat={true}
            />
            <EuiButton onClick={() => setShowFlyout(true)} data-test-subj="viewDetailsLink">
              {i18nTexts.viewDetailsButtonLabel}
            </EuiButton>
          </EuiFlexGroup>
        </>
      ) : (
        <>
          <EuiSpacer />

          <EuiButton onClick={() => setShowFlyout(true)} data-test-subj="enableLogsLink">
            {i18nTexts.enableLogsButtonLabel}
          </EuiButton>
        </>
      )}
      <EuiSpacer size="m" />
    </>
  );
};

export const getLogsStep = ({ isComplete, setIsComplete }: OverviewStepProps): EuiStepProps => {
  const status = isComplete ? 'complete' : 'incomplete';

  const requiredPrivileges = [
    `index.${DEPRECATION_LOGS_INDEX}`,
    ...APP_LOGS_COUNT_CLUSTER_PRIVILEGES.map((privilege) => `cluster.${privilege}`),
  ];

  return {
    status,
    title: i18nTexts.logsStepTitle,
    'data-test-subj': `logsStep-${status}`,
    children: (
      <WithPrivileges privileges={requiredPrivileges}>
        {({ hasPrivileges, isLoading, privilegesMissing }) => (
          <LogsStep
            setIsComplete={setIsComplete}
            hasPrivileges={!isLoading && hasPrivileges}
            privilegesMissing={privilegesMissing}
          />
        )}
      </WithPrivileges>
    ),
  };
};
