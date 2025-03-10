/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { WizardContent } from '../../../template_form/template_form';
import { TemplateDeserialized } from '../../../../../../common';
import { Forms } from '../../../../../shared_imports';
import { useLoadNodesPlugins } from '../../../../services';
import { CommonWizardSteps } from './types';
import { StepMappings } from './step_mappings';

interface Props {
  esDocsBase: string;
  getTemplateData?: (wizardContent: WizardContent) => TemplateDeserialized;
}

export const StepMappingsContainer: React.FunctionComponent<Props> = ({
  esDocsBase,
  getTemplateData,
}) => {
  const { defaultValue, updateContent, getSingleContentData } = Forms.useContent<
    CommonWizardSteps,
    'mappings'
  >('mappings');
  const { data: esNodesPlugins } = useLoadNodesPlugins();

  const { getData } = Forms.useMultiContentContext<WizardContent>();

  let indexMode;
  if (getTemplateData) {
    const wizardContent = getData();
    // Build the current template object, providing the wizard content data
    const template = getTemplateData(wizardContent);
    indexMode = template?.indexMode;
  }

  return (
    <StepMappings
      defaultValue={defaultValue}
      onChange={updateContent}
      indexSettings={getSingleContentData('settings')}
      esDocsBase={esDocsBase}
      esNodesPlugins={esNodesPlugins ?? []}
      indexMode={indexMode}
    />
  );
};
