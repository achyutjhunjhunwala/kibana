/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect } from 'react';
import {
  EuiPanel,
  EuiSkeletonText,
  EuiSpacer,
  EuiSteps,
  EuiButtonGroup,
  EuiIconTip,
  EuiCodeBlock,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiAccordion,
  useEuiTheme,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { FormattedMessage } from '@kbn/i18n-react';
import { DASHBOARD_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import { css } from '@emotion/react';
import { usePerformanceContext } from '@kbn/ebt-tools';
import { type LogsLocatorParams, LOGS_LOCATOR_ID } from '@kbn/logs-shared-plugin/common';
import { ObservabilityOnboardingPricingFeature } from '../../../../common/pricing_features';
import { type ObservabilityOnboardingAppServices } from '../../..';
import { EmptyPrompt } from '../shared/empty_prompt';
import { GetStartedPanel } from '../shared/get_started_panel';
import { FeedbackButtons } from '../shared/feedback_buttons';
import { CopyToClipboardButton } from '../shared/copy_to_clipboard_button';
import { useKubernetesFlow } from '../kubernetes/use_kubernetes_flow';
import { useFlowBreadcrumb } from '../../shared/use_flow_breadcrumbs';
import { usePricingFeature } from '../shared/use_pricing_feature';

const OTEL_HELM_CHARTS_REPO = 'https://open-telemetry.github.io/opentelemetry-helm-charts';
const OTEL_KUBE_STACK_VERSION = '0.6.3';
const CLUSTER_OVERVIEW_DASHBOARD_ID = 'kubernetes_otel-cluster-overview';

export const OtelKubernetesPanel: React.FC = () => {
  useFlowBreadcrumb({
    text: i18n.translate('xpack.observability_onboarding.autoDetectPanel.breadcrumbs.k8sOtel', {
      defaultMessage: 'Kubernetes: OpenTelemetry',
    }),
  });
  const { data, error, refetch } = useKubernetesFlow('kubernetes_otel');
  const [idSelected, setIdSelected] = useState('nodejs');
  const {
    services: {
      share,
      context: { isServerless },
    },
  } = useKibana<ObservabilityOnboardingAppServices>();
  const apmLocator = share.url.locators.get('APM_LOCATOR');
  const dashboardLocator = share.url.locators.get(DASHBOARD_APP_LOCATOR);
  const logsLocator = share.url.locators.get<LogsLocatorParams>(LOGS_LOCATOR_ID);
  const theme = useEuiTheme();
  const { onPageReady } = usePerformanceContext();
  const metricsOnboardingEnabled = usePricingFeature(
    ObservabilityOnboardingPricingFeature.METRICS_ONBOARDING
  );

  useEffect(() => {
    if (data) {
      onPageReady({
        meta: {
          description: `[ttfmp_onboarding] Request to create the onboarding flow succeeded and the flow's UI has rendered`,
        },
      });
    }
  }, [data, onPageReady]);

  const ingestEndpointUrl = isServerless ? data?.managedOtlpServiceUrl : data?.elasticsearchUrl;

  if (error) {
    return (
      <EmptyPrompt onboardingFlowType="kubernetes_otel" error={error} onRetryClick={refetch} />
    );
  }

  const elasticEndpointVarName = isServerless ? 'elastic_otlp_endpoint' : 'elastic_endpoint';
  const valuesFileSubfolder = isServerless ? '/managed_otlp' : '';
  const valuesFileName =
    !isServerless || metricsOnboardingEnabled ? 'values.yaml' : 'logs-values.yaml';

  const otelKubeStackValuesFileUrl = data
    ? `https://raw.githubusercontent.com/elastic/elastic-agent/refs/tags/v${data.elasticAgentVersionInfo.agentBaseVersion}/deploy/helm/edot-collector/kube-stack${valuesFileSubfolder}/${valuesFileName}`
    : '';
  const namespace = 'opentelemetry-operator-system';
  const addRepoCommand = `helm repo add open-telemetry '${OTEL_HELM_CHARTS_REPO}' --force-update`;
  const installStackCommand = data
    ? `kubectl create namespace ${namespace}
kubectl create secret generic elastic-secret-otel \\
  --namespace ${namespace} \\
  --from-literal=${elasticEndpointVarName}='${ingestEndpointUrl}' \\
  --from-literal=elastic_api_key='${data.apiKeyEncoded}'
helm upgrade --install opentelemetry-kube-stack open-telemetry/opentelemetry-kube-stack \\
  --namespace ${namespace} \\
  --values '${otelKubeStackValuesFileUrl}' \\
  --version '${OTEL_KUBE_STACK_VERSION}'`
    : undefined;

  return (
    <EuiPanel hasBorder paddingSize="xl">
      <EuiSteps
        steps={[
          {
            title: i18n.translate(
              'xpack.observability_onboarding.otelKubernetesPanel.addRepositoryStepTitle',
              {
                defaultMessage: 'Add the OpenTelemetry repository to Helm',
              }
            ),
            children: (
              <>
                <EuiCodeBlock paddingSize="m" language="bash">
                  {addRepoCommand}
                </EuiCodeBlock>
                <EuiSpacer />
                <CopyToClipboardButton
                  textToCopy={addRepoCommand}
                  data-test-subj="observabilityOnboardingOtelKubernetesPanelAddRepositoryCopyToClipboard"
                />
              </>
            ),
          },
          {
            title: i18n.translate(
              'xpack.observability_onboarding.otelKubernetesPanel.installStackStepTitle',
              {
                defaultMessage: 'Install the OpenTelemetry Operator',
              }
            ),
            children: installStackCommand ? (
              <>
                <p>
                  <FormattedMessage
                    id="xpack.observability_onboarding.otelKubernetesPanel.injectAutoinstrumentationLibrariesForLabel"
                    defaultMessage="Install the OpenTelemetry Operator using the kube-stack Helm chart and the provided values file. For automatic certificate renewal, we recommend installing the {link}, and customize the values.yaml file before the installation as described {doc}."
                    values={{
                      link: (
                        <EuiLink
                          href="https://cert-manager.io/docs/installation/"
                          target="_blank"
                          data-test-subj="observabilityOnboardingOtelKubernetesPanelCertManagerLink"
                        >
                          {i18n.translate(
                            'xpack.observability_onboarding.otelKubernetesPanel.certmanagerLinkLabel',
                            { defaultMessage: 'cert-manager' }
                          )}
                        </EuiLink>
                      ),
                      doc: (
                        <EuiLink
                          href="https://ela.st/8-16-otel-cert-manager"
                          target="_blank"
                          data-test-subj="observabilityOnboardingOtelKubernetesPanelCertManagerDocsLink"
                        >
                          {i18n.translate(
                            'xpack.observability_onboarding.otelKubernetesPanel.certmanagerDocsLinkLabel',
                            { defaultMessage: 'in our documentation' }
                          )}
                        </EuiLink>
                      ),
                    }}
                  />{' '}
                  <EuiIconTip
                    content={i18n.translate(
                      'xpack.observability_onboarding.otelKubernetesPanel.helmsAutogeneratedTLSCertificatesTextLabel',
                      {
                        defaultMessage:
                          "Helm's autogenerated TLS certificates have a default expiration period of 365 days. These certificates are not renewed automatically unless the release is manually updated. Enabling cert-manager allows for automatic certificate renewal.",
                      }
                    )}
                    position="top"
                    type="info"
                  />
                </p>
                <EuiSpacer />
                <EuiCodeBlock paddingSize="m" language="bash">
                  {installStackCommand}
                </EuiCodeBlock>
                <EuiSpacer />
                <EuiFlexGroup alignItems="center" justifyContent="flexStart">
                  <EuiFlexItem grow={false}>
                    <CopyToClipboardButton
                      textToCopy={installStackCommand}
                      data-test-subj="observabilityOnboardingOtelKubernetesPanelInstallStackCopyToClipboard"
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="download"
                      href={otelKubeStackValuesFileUrl}
                      flush="left"
                      target="_blank" // The `download` attribute does not work cross-origin so it's better to open the file in a new tab
                      data-test-subj="observabilityOnboardingOtelKubernetesPanelDownloadValuesFileButton"
                    >
                      {i18n.translate(
                        'xpack.observability_onboarding.otelKubernetesPanel.downloadValuesFileButtonEmptyLabel',
                        { defaultMessage: 'Download values file' }
                      )}
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </>
            ) : (
              <EuiSkeletonText lines={6} />
            ),
          },
          ...(metricsOnboardingEnabled
            ? [
                {
                  title: i18n.translate(
                    'xpack.observability_onboarding.otelKubernetesPanel.instrumentApplicationStepTitle',
                    {
                      defaultMessage: 'Instrument your application (optional)',
                    }
                  ),
                  children: (
                    <>
                      <p>
                        {i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.theOperatorAutomatesTheLabel',
                          {
                            defaultMessage:
                              'The Operator automates the injection of auto-instrumentation libraries into the annotated pods for some languages.',
                          }
                        )}
                      </p>
                      <EuiSpacer />
                      <EuiButtonGroup
                        legend={i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.selectProgrammingLanguageLegend',
                          {
                            defaultMessage: 'Select a programming language',
                          }
                        )}
                        idSelected={idSelected}
                        onChange={(optionId) => setIdSelected(optionId)}
                        options={[
                          {
                            id: 'nodejs',
                            label: 'Node.js',
                          },
                          {
                            id: 'java',
                            label: 'Java',
                          },
                          {
                            id: 'python',
                            label: 'Python',
                          },
                          {
                            id: 'dotnet',
                            label: '.NET',
                          },
                          {
                            id: 'go',
                            label: 'Go',
                          },
                        ]}
                      />
                      <EuiSpacer />
                      <p
                        css={css`
                          font-weight: ${theme.euiTheme.font.weight.bold};
                        `}
                      >
                        {i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.step3a.title',
                          { defaultMessage: '3(a) - Start with one of these annotations methods:' }
                        )}
                      </p>
                      <EuiSpacer />
                      <EuiAccordion
                        id={'otelKubernetesAccordionSingleDeployment'}
                        paddingSize="s"
                        buttonContent={i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.annotation.deployment',
                          {
                            defaultMessage:
                              'Annotate specific deployment Pods modifying its manifest',
                          }
                        )}
                      >
                        <EuiCodeBlock paddingSize="m" language="yaml" isCopyable={true}>
                          {`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  ...
  template:
    metadata:
      annotations:
        instrumentation.opentelemetry.io/inject-${idSelected}: "${namespace}/elastic-instrumentation"
      ...
    spec:
      containers:
      - image: myapplication-image
        name: app
      ...`}
                        </EuiCodeBlock>
                      </EuiAccordion>
                      <EuiSpacer />
                      <EuiAccordion
                        id={'otelKubernetesAccordionAllResources'}
                        paddingSize="s"
                        buttonContent={i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.annotation.resources',
                          { defaultMessage: 'Annotate all resources in a namespace' }
                        )}
                      >
                        <EuiCodeBlock
                          paddingSize="m"
                          language="bash"
                          isCopyable={true}
                          data-test-subj="observabilityOnboardingOtelKubernetesPanelAnnotateAllResourcesSnippet"
                        >
                          {`kubectl annotate namespace my-namespace instrumentation.opentelemetry.io/inject-${idSelected}="${namespace}/elastic-instrumentation"`}
                        </EuiCodeBlock>
                      </EuiAccordion>
                      <EuiSpacer />
                      <p
                        css={css`
                          font-weight: ${theme.euiTheme.font.weight.bold};
                        `}
                      >
                        {i18n.translate(
                          'xpack.observability_onboarding.otelKubernetesPanel.step3b.title',
                          {
                            defaultMessage:
                              '3(b) - Restart deployment and ensure the annotations are applied and the auto-instrumentation library is injected:',
                          }
                        )}
                      </p>
                      <EuiSpacer />
                      <EuiCodeBlock
                        paddingSize="m"
                        language="bash"
                        isCopyable={true}
                        data-test-subj="observabilityOnboardingOtelKubernetesPanelRestartDeploymentSnippet"
                      >
                        {`kubectl rollout restart deployment myapp -n my-namespace

kubectl describe pod <myapp-pod-name> -n my-namespace`}
                      </EuiCodeBlock>
                      <EuiSpacer />
                      <p>
                        <FormattedMessage
                          id="xpack.observability_onboarding.otelKubernetesPanel.forOtherLanguagesThatLabel"
                          defaultMessage="For other languages where auto-instrumentation is not available, {link}"
                          values={{
                            link: (
                              <EuiLink
                                href="https://ela.st/8-16-otel-apm-instrumentation"
                                data-test-subj="observabilityOnboardingOtelKubernetesPanelReferToTheDocumentationLink"
                                target="_blank"
                              >
                                {i18n.translate(
                                  'xpack.observability_onboarding.otelKubernetesPanel.referToTheDocumentationLinkLabel',
                                  { defaultMessage: 'refer to the documentation' }
                                )}
                              </EuiLink>
                            ),
                          }}
                        />
                      </p>
                    </>
                  ),
                },
              ]
            : []),
          {
            title: i18n.translate(
              'xpack.observability_onboarding.otelKubernetesPanel.monitorStepTitle',
              {
                defaultMessage: 'Visualize your data',
              }
            ),
            children: data ? (
              <>
                <p>
                  {metricsOnboardingEnabled && (
                    <FormattedMessage
                      id="xpack.observability_onboarding.otelKubernetesPanel.onceYourKubernetesInfrastructureLabel"
                      defaultMessage="Analyze your Kubernetes cluster’s health and monitor your container workloads."
                    />
                  )}
                  {!metricsOnboardingEnabled && (
                    <FormattedMessage
                      id="xpack.observability_onboarding.logsEssentials.otelKubernetesPanel.onceYourKubernetesInfrastructureLabel"
                      defaultMessage="After running the previous command, come back and view your data."
                    />
                  )}
                </p>
                <EuiSpacer />
                <GetStartedPanel
                  onboardingFlowType="kubernetes_otel"
                  onboardingId={data.onboardingId}
                  dataset="kubernetes"
                  integration="kubernetes_otel"
                  newTab={false}
                  isLoading={false}
                  actionLinks={
                    metricsOnboardingEnabled
                      ? [
                          {
                            id: CLUSTER_OVERVIEW_DASHBOARD_ID,
                            title: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.monitoringCluster',
                              {
                                defaultMessage: 'Check your Kubernetes cluster health:',
                              }
                            ),
                            label: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.exploreDashboard',
                              {
                                defaultMessage: 'Explore Kubernetes Cluster Dashboard',
                              }
                            ),
                            href:
                              dashboardLocator?.getRedirectUrl({
                                dashboardId: CLUSTER_OVERVIEW_DASHBOARD_ID,
                              }) ?? '',
                          },
                          {
                            id: 'services',
                            title: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.servicesTitle',
                              {
                                defaultMessage: 'Check your application services:',
                              }
                            ),
                            label: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.servicesLabel',
                              {
                                defaultMessage: 'Explore Service inventory',
                              }
                            ),
                            href: apmLocator?.getRedirectUrl({ serviceName: undefined }) ?? '',
                          },
                        ]
                      : [
                          {
                            id: 'logs',
                            title: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.logsTitle',
                              {
                                defaultMessage: 'View and analyze your logs:',
                              }
                            ),
                            label: i18n.translate(
                              'xpack.observability_onboarding.otelKubernetesPanel.logsLabel',
                              {
                                defaultMessage: 'Explore logs',
                              }
                            ),
                            href: logsLocator?.getRedirectUrl({}) ?? '',
                          },
                        ]
                  }
                />
              </>
            ) : (
              <EuiSkeletonText lines={6} />
            ),
          },
        ]}
      />
      <FeedbackButtons flow="otel_kubernetes" />
    </EuiPanel>
  );
};
