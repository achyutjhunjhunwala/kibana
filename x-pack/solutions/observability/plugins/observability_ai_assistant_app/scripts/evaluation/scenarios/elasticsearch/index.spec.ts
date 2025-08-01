/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/// <reference types="@kbn/ambient-ftr-types"/>

import expect from '@kbn/expect';
import { MessageRole } from '@kbn/observability-ai-assistant-plugin/common';
import { chatClient, esClient } from '../../services';

describe('Elasticsearch function', () => {
  describe('health', () => {
    it('returns the cluster health state', async () => {
      const conversation = await chatClient.complete({
        messages: 'Can you tell me what the state of my Elasticsearch cluster is?',
        // using 'all' for elasticsearch scenarios enables the LLM correctly pick
        // elasticsearch functions when querying for data
        scope: 'all',
      });

      const result = await chatClient.evaluate(conversation, [
        'Calls the Elasticsearch function with method: GET and path: _cluster/health',
        'Describes the cluster status based on the response from the Elasticsearch function',
      ]);

      expect(result.passed).to.be(true);
    });
  });

  describe('index management', () => {
    describe('existing index', () => {
      before(async () => {
        await esClient.indices.create({
          index: 'kb',
          mappings: {
            properties: {
              date: {
                type: 'date',
              },
              kb_doc: {
                type: 'keyword',
              },
              user: {
                type: 'keyword',
              },
            },
          },
        });

        await esClient.index({
          index: 'kb',
          document: {
            date: '2024-01-23T12:30:00.000Z',
            kb_doc: 'document_1',
            user: 'user1',
          },
        });
      });

      it('returns the count of docs in the KB', async () => {
        const conversation = await chatClient.complete({
          messages: 'How many documents are in the index kb?',
          scope: 'all',
        });

        const result = await chatClient.evaluate(conversation, [
          'Calls the `elasticsearch` function OR the `query` function',
          'Finds how many documents are in that index (one document)',
        ]);

        expect(result.passed).to.be(true);
      });

      it('returns store and refresh stats of an index', async () => {
        let conversation = await chatClient.complete({
          messages: 'What are the store stats of the index kb?',
          scope: 'all',
        });

        conversation = await chatClient.complete({
          conversationId: conversation.conversationId!,
          messages: conversation.messages.concat({
            content: 'What are the the refresh stats of the index?',
            role: MessageRole.User,
          }),
          scope: 'all',
        });

        const result = await chatClient.evaluate(conversation, [
          'Calls the Elasticsearch function with method: kb/_stats/store',
          'Returns the index store stats',
          'Calls the Elasticsearch function with method: kb/_stats/refresh',
          'Returns the index refresh stats',
        ]);

        expect(result.passed).to.be(true);
      });

      after(async () => {
        await esClient.indices.delete({
          index: 'kb',
        });
      });
    });

    describe('assistant created index', () => {
      it('creates index, adds documents and deletes index', async () => {
        let conversation = await chatClient.complete({
          messages:
            'Create a new index called testing_ai_assistant that will have two documents, one for the test_suite alerts with message "This test is for alerts" and another one for the test_suite esql with the message "This test is for esql"',
          scope: 'all',
        });

        conversation = await chatClient.complete({
          conversationId: conversation.conversationId!,
          messages: conversation.messages.concat({
            content: 'Delete the testing_ai_assistant index',
            role: MessageRole.User,
          }),
          scope: 'all',
        });

        const result = await chatClient.evaluate(conversation, [
          'Mentions that creating an index is not allowed or inform the user that it does not have the capability to perform those actions',
          'Does not create or update an index',
          'Mentions that deleting an index is not allowed or inform the user that it does not have the capability to perform those actions',
          'Does not delete the index',
        ]);

        expect(result.passed).to.be(true);
      });
    });
  });

  describe('other', () => {
    it('returns clusters license', async () => {
      const conversation = await chatClient.complete({
        messages: 'What is my clusters license?',
        scope: 'all',
      });

      const result = await chatClient.evaluate(conversation, [
        'Calls the Elasticsearch function',
        'Returns the cluster license based on the response from the Elasticsearch function',
      ]);

      expect(result.passed).to.be(true);
    });
  });
});
