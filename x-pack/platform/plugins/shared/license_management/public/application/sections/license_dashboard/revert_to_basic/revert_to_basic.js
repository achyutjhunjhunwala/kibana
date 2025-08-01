/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import {
  EuiFlexItem,
  EuiCard,
  EuiButton,
  EuiLink,
  EuiConfirmModal,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { EXTERNAL_LINKS } from '../../../../../common/constants';
import { i18n } from '@kbn/i18n';

export class RevertToBasic extends React.PureComponent {
  cancel = () => {
    this.props.uploadLicenseStatus({});
  };

  acknowledgeModal() {
    const {
      needsAcknowledgement,
      messages: [firstLine, ...messages] = [],
      startBasicLicense,
      cancelStartBasicLicense,
      licenseType,
    } = this.props;
    if (!needsAcknowledgement) {
      return null;
    }
    const confirmModalTitleId = htmlIdGenerator()('confirmModalTitle');
    return (
      <EuiConfirmModal
        title={i18n.translate(
          'xpack.licenseMgmt.licenseDashboard.revertToBasic.confirmModalTitle',
          { defaultMessage: 'Confirm Revert to Basic License' }
        )}
        onCancel={cancelStartBasicLicense}
        onConfirm={() => startBasicLicense(licenseType, true)}
        cancelButtonText={
          <FormattedMessage
            id="xpack.licenseMgmt.licenseDashboard.revertToBasic.confirmModal.cancelButtonLabel"
            defaultMessage="Cancel"
          />
        }
        confirmButtonText={
          <FormattedMessage
            id="xpack.licenseMgmt.licenseDashboard.revertToBasic.confirmModal.confirmButtonLabel"
            defaultMessage="Confirm"
          />
        }
        aria-labelledby={confirmModalTitleId}
        titleProps={{ id: confirmModalTitleId }}
      >
        <div>
          <EuiText>{firstLine}</EuiText>
          <EuiText>
            <ul>
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </EuiText>
        </div>
      </EuiConfirmModal>
    );
  }
  render() {
    const { licenseType, shouldShowRevertToBasicLicense, startBasicLicense } = this.props;
    if (!shouldShowRevertToBasicLicense) {
      return null;
    }
    const description = (
      <span>
        <FormattedMessage
          id="xpack.licenseMgmt.licenseDashboard.revertToBasic.revertToFreeFeaturesDescription"
          defaultMessage="You’ll revert to our free features and lose access to
          machine learning, advanced security, and other {subscriptionFeaturesLinkText}."
          values={{
            subscriptionFeaturesLinkText: (
              <EuiLink href={EXTERNAL_LINKS.SUBSCRIPTIONS} target="_blank">
                <FormattedMessage
                  id="xpack.licenseMgmt.licenseDashboard.revertToBasic.subscriptionFeaturesLinkText"
                  defaultMessage="subscription features"
                />
              </EuiLink>
            ),
          }}
        />
      </span>
    );

    return (
      <EuiFlexItem>
        {this.acknowledgeModal()}
        <EuiCard
          hasBorder
          title={
            <FormattedMessage
              id="xpack.licenseMgmt.licenseDashboard.revertToBasic.acknowledgeModalTitle"
              defaultMessage="Revert to Basic license"
            />
          }
          description={description}
          footer={
            <EuiButton
              data-test-subj="revertToBasicButton"
              onClick={() => startBasicLicense(licenseType)}
            >
              <FormattedMessage
                id="xpack.licenseMgmt.licenseDashboard.revertToBasic.acknowledgeModal.revertToBasicButtonLabel"
                defaultMessage="Revert to Basic"
              />
            </EuiButton>
          }
        />
      </EuiFlexItem>
    );
  }
}
