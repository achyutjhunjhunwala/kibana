/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { EuiFlexGroup, EuiLoadingSpinner } from '@elastic/eui';
import { KibanaPageTemplate } from '@kbn/shared-ux-page-kibana-template';
import { Route, Routes } from '@kbn/shared-ux-router';

import { PLUGIN_ID } from '../../../common';
import { useKibana } from '../../hooks/use_kibana';
import { useLoadConnectors } from '../../hooks/use_load_connectors';
import { usePlaygroundBreadcrumbs } from '../../hooks/use_playground_breadcrumbs';
import { useSavedPlaygroundParameters } from '../../hooks/use_saved_playground_parameters';
import { useSearchPlaygroundFeatureFlag } from '../../hooks/use_search_playground_feature_flag';
import { useShowSetupPage } from '../../hooks/use_show_setup_page';
import {
  SAVED_PLAYGROUND_CHAT_PATH,
  SAVED_PLAYGROUND_CHAT_QUERY_PATH,
  SAVED_PLAYGROUND_SEARCH_PATH,
  SAVED_PLAYGROUND_SEARCH_QUERY_PATH,
} from '../../routes';
import {
  PlaygroundPageMode,
  PlaygroundViewMode,
  SavedPlaygroundForm,
  SavedPlaygroundFormFields,
} from '../../types';
import { isSavedPlaygroundFormDirty } from '../../utils/saved_playgrounds';

import { Chat } from '../chat';
import { SavedPlaygroundHeader } from './saved_playground_header';
import { ChatSetupPage } from '../setup_page/chat_setup_page';
import { SearchMode } from '../search_mode/search_mode';
import { SearchQueryMode } from '../query_mode/search_query_mode';

import { SavedPlaygroundFetchError } from './saved_playground_fetch_error';
import { EditPlaygroundNameModal } from './edit_name_modal';
import { DeletePlaygroundModal } from './delete_playground_modal';
import { SavePlaygroundModal } from './save_playground_modal';
import { SearchPlaygroundSetupPage } from '../setup_page/search_playground_setup_page';

enum SavedPlaygroundModals {
  None,
  EditName,
  Delete,
  Copy,
}

export const SavedPlayground = () => {
  const [shownModal, setShownModal] = useState<SavedPlaygroundModals>(SavedPlaygroundModals.None);
  const isSearchModeEnabled = useSearchPlaygroundFeatureFlag();
  const { playgroundId, pageMode, viewMode } = useSavedPlaygroundParameters();
  const { application, history } = useKibana().services;
  const { data: connectors } = useLoadConnectors();
  const { formState, watch } = useFormContext<SavedPlaygroundForm>();
  const playgroundName = watch(SavedPlaygroundFormFields.name);
  const playgroundIndices = watch(SavedPlaygroundFormFields.indices);
  const summarizationModel = watch(SavedPlaygroundFormFields.summarizationModel);
  usePlaygroundBreadcrumbs(playgroundName);
  const { showSetupPage } = useShowSetupPage({
    hasSelectedIndices: !formState.isLoading && playgroundIndices.length > 0,
    hasConnectors: Boolean(connectors?.length),
  });
  const navigateToNewPlayground = useCallback(
    (id: string, page: PlaygroundPageMode, view?: PlaygroundViewMode, searchParams?: string) => {
      let path = `/p/${id}/${page}`;
      if (view && view !== PlaygroundViewMode.preview) {
        path += `/${view}`;
      }
      if (searchParams) {
        path += searchParams;
      }
      history.push(path);
    },
    [history]
  );
  const navigateToView = useCallback(
    (id: string, page: PlaygroundPageMode, view?: PlaygroundViewMode, searchParams?: string) => {
      let path = `/p/${id}/${page}`;
      if (view && view !== PlaygroundViewMode.preview) {
        path += `/${view}`;
      }
      if (searchParams) {
        path += searchParams;
      }
      application.navigateToApp(PLUGIN_ID, {
        path,
      });
    },
    [application]
  );
  useEffect(() => {
    if (formState.isLoading) return;
    if (pageMode === undefined) {
      // If there is not a pageMode set we default to Chat mode
      navigateToView(playgroundId, PlaygroundPageMode.Chat, PlaygroundViewMode.preview);
      return;
    }
    // Handle Unknown modes
    if (!Object.values(PlaygroundPageMode).includes(pageMode)) {
      navigateToView(playgroundId, PlaygroundPageMode.Chat, PlaygroundViewMode.preview);
      return;
    }
    if (!Object.values(PlaygroundViewMode).includes(viewMode)) {
      navigateToView(playgroundId, pageMode, PlaygroundViewMode.preview);
    }
  }, [playgroundId, pageMode, viewMode, summarizationModel, formState.isLoading, navigateToView]);
  const { isDirty, dirtyFields } = formState;
  const savedFormIsDirty = useMemo(() => {
    if (!isDirty) return false;
    return isSavedPlaygroundFormDirty(dirtyFields);
  }, [isDirty, dirtyFields]);
  const onCloseModal = useCallback(() => setShownModal(SavedPlaygroundModals.None), []);
  const onDeleteSuccess = useCallback(() => {
    onCloseModal();
    application.navigateToApp(PLUGIN_ID);
  }, [application, onCloseModal]);

  const handleModeChange = (id: PlaygroundViewMode) =>
    navigateToView(playgroundId, pageMode ?? PlaygroundPageMode.Search, id, location.search);
  const handlePageModeChange = (mode: PlaygroundPageMode) =>
    navigateToView(playgroundId, mode, viewMode, location.search);

  const { isLoading } = formState;
  if (isLoading || pageMode === undefined) {
    return (
      <KibanaPageTemplate.Section>
        <EuiFlexGroup justifyContent="center">
          <EuiLoadingSpinner />
        </EuiFlexGroup>
      </KibanaPageTemplate.Section>
    );
  }
  if (playgroundName.length === 0 && playgroundIndices.length === 0) {
    return <SavedPlaygroundFetchError />;
  }
  return (
    <>
      <SavedPlaygroundHeader
        playgroundName={playgroundName}
        hasChanges={savedFormIsDirty}
        pageMode={pageMode}
        viewMode={viewMode}
        onModeChange={handleModeChange}
        isActionsDisabled={false}
        onSelectPageModeChange={handlePageModeChange}
        onEditName={() => setShownModal(SavedPlaygroundModals.EditName)}
        onDeletePlayground={() => setShownModal(SavedPlaygroundModals.Delete)}
        onCopyPlayground={() => setShownModal(SavedPlaygroundModals.Copy)}
      />
      <Routes>
        {showSetupPage ? (
          <>
            <Route path={SAVED_PLAYGROUND_CHAT_PATH} component={ChatSetupPage} />
            {isSearchModeEnabled && (
              <Route path={SAVED_PLAYGROUND_SEARCH_PATH} component={SearchPlaygroundSetupPage} />
            )}
          </>
        ) : (
          <>
            <Route exact path={SAVED_PLAYGROUND_CHAT_PATH} component={Chat} />
            <Route
              exact
              path={SAVED_PLAYGROUND_CHAT_QUERY_PATH}
              render={() => <SearchQueryMode pageMode={pageMode} />}
            />
            {isSearchModeEnabled && (
              <>
                <Route exact path={SAVED_PLAYGROUND_SEARCH_PATH} component={SearchMode} />
                <Route
                  exact
                  path={SAVED_PLAYGROUND_SEARCH_QUERY_PATH}
                  render={() => <SearchQueryMode pageMode={pageMode} />}
                />
              </>
            )}
          </>
        )}
      </Routes>
      {shownModal === SavedPlaygroundModals.EditName && (
        <EditPlaygroundNameModal playgroundName={playgroundName} onClose={onCloseModal} />
      )}
      {shownModal === SavedPlaygroundModals.Delete && (
        <DeletePlaygroundModal
          playgroundId={playgroundId}
          playgroundName={playgroundName}
          onClose={onCloseModal}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
      {shownModal === SavedPlaygroundModals.Copy && (
        <SavePlaygroundModal
          saveAs
          playgroundName={playgroundName}
          onClose={onCloseModal}
          onNavigateToNewPlayground={(id: string) => {
            navigateToNewPlayground(
              id,
              pageMode ?? PlaygroundPageMode.Chat,
              viewMode,
              location.search
            );
          }}
        />
      )}
    </>
  );
};
