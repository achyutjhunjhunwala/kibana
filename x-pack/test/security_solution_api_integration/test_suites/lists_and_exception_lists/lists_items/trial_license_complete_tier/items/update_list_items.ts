/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import type {
  UpdateListItemSchema,
  CreateListItemSchema,
  ListItemSchema,
} from '@kbn/securitysolution-io-ts-list-types';
import { LIST_URL, LIST_ITEM_URL } from '@kbn/securitysolution-list-constants';
import { getListItemResponseMockWithoutAutoGeneratedValues } from '@kbn/lists-plugin/common/schemas/response/list_item_schema.mock';
import { getCreateMinimalListItemSchemaMock } from '@kbn/lists-plugin/common/schemas/request/create_list_item_schema.mock';
import { getCreateMinimalListSchemaMock } from '@kbn/lists-plugin/common/schemas/request/create_list_schema.mock';
import { getUpdateMinimalListItemSchemaMock } from '@kbn/lists-plugin/common/schemas/request/update_list_item_schema.mock';

import TestAgent from 'supertest/lib/agent';
import {
  createListsIndex,
  deleteListsIndex,
  removeListItemServerGeneratedProperties,
} from '../../../utils';
import { FtrProviderContext } from '../../../../../ftr_provider_context';

export default ({ getService }: FtrProviderContext) => {
  const log = getService('log');
  const retry = getService('retry');
  const utils = getService('securitySolutionUtils');

  describe('@ess @serverless @serverlessQA update_list_items', () => {
    let supertest: TestAgent;

    before(async () => {
      supertest = await utils.createSuperTest();
    });

    describe('update list items', () => {
      beforeEach(async () => {
        await createListsIndex(supertest, log);
      });

      afterEach(async () => {
        await deleteListsIndex(supertest, log);
      });

      it('should update a single list item property of value using an id', async () => {
        // create a simple list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // create a simple list item
        await supertest
          .post(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListItemSchemaMock())
          .expect(200);

        // update a simple list item's value
        const updatedListItem: UpdateListItemSchema = {
          ...getUpdateMinimalListItemSchemaMock(),
          value: '192.168.0.2',
        };

        const { body } = await supertest
          .put(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedListItem);

        const outputListItem: Partial<ListItemSchema> = {
          ...getListItemResponseMockWithoutAutoGeneratedValues(await utils.getUsername()),
          value: '192.168.0.2',
        };
        const bodyToCompare = removeListItemServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(outputListItem);

        await retry.waitFor('updates should be persistent', async () => {
          const { body: listItemBody } = await supertest
            .get(LIST_ITEM_URL)
            .query({ id: getCreateMinimalListItemSchemaMock().id })
            .set('kbn-xsrf', 'true');

          expect(removeListItemServerGeneratedProperties(listItemBody)).to.eql(outputListItem);
          return true;
        });
      });

      it('should update a single list item of value using an auto-generated id of both list and list item', async () => {
        const { id, ...listNoId } = getCreateMinimalListSchemaMock();
        // create a simple list with no id which will use an auto-generated id
        const { body: createListBody } = await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(listNoId)
          .expect(200);

        // create a simple list item also with an auto-generated id using the list's auto-generated id
        const listItem: CreateListItemSchema = {
          ...getCreateMinimalListItemSchemaMock(),
          list_id: createListBody.id,
        };
        const { body: createListItemBody } = await supertest
          .post(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(listItem)
          .expect(200);

        // update a simple list item's value
        const updatedList: UpdateListItemSchema = {
          ...getUpdateMinimalListItemSchemaMock(),
          id: createListItemBody.id,
          value: '192.168.0.2',
        };
        const { body } = await supertest
          .put(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedList)
          .expect(200);

        const outputListItem: Partial<ListItemSchema> = {
          ...getListItemResponseMockWithoutAutoGeneratedValues(await utils.getUsername()),
          value: '192.168.0.2',
        };
        const bodyToCompare = {
          ...removeListItemServerGeneratedProperties(body),
          list_id: outputListItem.list_id,
        };
        expect(bodyToCompare).to.eql(outputListItem);

        await retry.waitFor('updates should be persistent', async () => {
          const { body: listItemBody } = await supertest
            .get(LIST_ITEM_URL)
            .query({ id: createListItemBody.id })
            .set('kbn-xsrf', 'true');
          const listItemBodyToCompare = {
            ...removeListItemServerGeneratedProperties(listItemBody),
            list_id: outputListItem.list_id,
          };
          expect(listItemBodyToCompare).to.eql(outputListItem);
          return true;
        });
      });

      it('should remove unspecified in update payload meta property', async () => {
        // create a simple list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // create a simple list item
        await supertest
          .post(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send({ ...getCreateMinimalListItemSchemaMock(), meta: { test: true } })
          .expect(200);

        // update a simple list item's value
        const updatedListItem: UpdateListItemSchema = {
          ...getUpdateMinimalListItemSchemaMock(),
          value: '192.168.0.2',
        };

        const { body } = await supertest
          .put(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedListItem);

        expect(body.meta).to.eql(undefined);

        await retry.waitFor('updates should be persistent', async () => {
          const { body: listItemBody } = await supertest
            .get(LIST_ITEM_URL)
            .query({ id: getCreateMinimalListItemSchemaMock().id })
            .set('kbn-xsrf', 'true');

          expect(listItemBody.meta).to.eql(undefined);
          return true;
        });
      });

      it('should give a 404 if it is given a fake id', async () => {
        // create a simple list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // create a simple list item
        await supertest
          .post(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListItemSchemaMock())
          .expect(200);

        // update a simple list item's value
        const updatedListItem: UpdateListItemSchema = {
          ...getUpdateMinimalListItemSchemaMock(),
          id: 'some-other-id',
          value: '192.168.0.2',
        };

        const { body } = await supertest
          .put(LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedListItem)
          .expect(404);

        expect(body).to.eql({
          status_code: 404,
          message: 'list item id: "some-other-id" not found',
        });
      });

      describe('version control OCC', () => {
        it('should return error if _version in payload mismatched', async () => {
          const { id, ...listNoId } = getCreateMinimalListSchemaMock();
          // create a simple list with no id which will use an auto-generated id
          const { body: createListBody } = await supertest
            .post(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(listNoId)
            .expect(200);

          // create a simple list item also with an auto-generated id using the list's auto-generated id
          const listItem: CreateListItemSchema = {
            ...getCreateMinimalListItemSchemaMock(),
            list_id: createListBody.id,
          };
          const { body: createListItemBody } = await supertest
            .post(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send(listItem)
            .expect(200);

          // update a simple list item's value
          const updatedListItem: UpdateListItemSchema = {
            ...getUpdateMinimalListItemSchemaMock(),
            id: createListItemBody.id,
            value: '192.168.0.2',
            _version: createListItemBody._version,
          };
          await supertest
            .put(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send(updatedListItem)
            .expect(200);

          // next update with the same _version should return 409
          const { body: errorBody } = await supertest
            .put(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send(updatedListItem)
            .expect(409);

          expect(errorBody.message).to.equal(
            'Conflict: versions mismatch. Provided versions:{"if_primary_term":1,"if_seq_no":0} does not match {"if_primary_term":1,"if_seq_no":1}'
          );
        });

        it('should return updated _version', async () => {
          const { id, ...listNoId } = getCreateMinimalListSchemaMock();
          // create a simple list with no id which will use an auto-generated id
          const { body: createListBody } = await supertest
            .post(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(listNoId)
            .expect(200);

          // create a simple list item also with an auto-generated id using the list's auto-generated id
          const listItem: CreateListItemSchema = {
            ...getCreateMinimalListItemSchemaMock(),
            list_id: createListBody.id,
          };
          const { body: createListItemBody } = await supertest
            .post(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send(listItem)
            .expect(200);

          // update a simple list item's value
          const updatedListItem: UpdateListItemSchema = {
            ...getUpdateMinimalListItemSchemaMock(),
            id: createListItemBody.id,
            value: '192.168.0.2',
            _version: createListItemBody._version,
          };
          const { body: updatedListItemBody } = await supertest
            .put(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send(updatedListItem)
            .expect(200);

          // next update with the new version should be successful
          await supertest
            .put(LIST_ITEM_URL)
            .set('kbn-xsrf', 'true')
            .send({ ...updatedListItem, _version: updatedListItemBody._version })
            .expect(200);
        });
      });
    });
  });
};
