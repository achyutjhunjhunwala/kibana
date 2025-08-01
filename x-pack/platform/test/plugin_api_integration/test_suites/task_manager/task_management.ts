/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';
import { random } from 'lodash';
import expect from '@kbn/expect';
import type { estypes } from '@elastic/elasticsearch';
import { taskMappings as TaskManagerMapping } from '@kbn/task-manager-plugin/server/saved_objects/mappings';
import {
  ConcreteTaskInstance,
  BulkUpdateTaskResult,
  Frequency,
} from '@kbn/task-manager-plugin/server';
import { FtrProviderContext } from '../../ftr_provider_context';

const { properties: taskManagerIndexMapping } = TaskManagerMapping;

export interface RawDoc {
  _id: string;
  _source: any;
  _type?: string;
}
export interface SearchResults {
  hits: {
    hits: RawDoc[];
  };
}

type DeprecatedConcreteTaskInstance = Omit<ConcreteTaskInstance, 'schedule'> & {
  interval: string;
};

type SerializedConcreteTaskInstance<State = string, Params = string> = Omit<
  ConcreteTaskInstance,
  'state' | 'params' | 'scheduledAt' | 'startedAt' | 'retryAt' | 'runAt'
> & {
  state: State;
  params: Params;
  scheduledAt: string;
  startedAt: string | null;
  retryAt: string | null;
  runAt: string;
};

export default function ({ getService }: FtrProviderContext) {
  const es = getService('es');
  const log = getService('log');
  const retry = getService('retry');
  const supertest = getService('supertest');
  const testHistoryIndex = '.kibana_task_manager_test_result';

  describe('scheduling and running tasks', () => {
    beforeEach(async () => {
      // clean up before each test
      await supertest.delete('/api/sample_tasks').set('kbn-xsrf', 'xxx').expect(200);
      const exists = await es.indices.exists({ index: testHistoryIndex });
      if (exists) {
        await es.deleteByQuery({
          index: testHistoryIndex,
          refresh: true,
          query: { term: { type: 'task' } },
        });
      } else {
        await es.indices.create({
          index: testHistoryIndex,
          mappings: {
            properties: {
              type: {
                type: 'keyword',
              },
              taskId: {
                type: 'keyword',
              },
              params: taskManagerIndexMapping.params,
              state: taskManagerIndexMapping.state,
              runAt: taskManagerIndexMapping.runAt,
            } as Record<string, estypes.MappingProperty>,
          },
        });
      }
    });

    after(async () => {
      // clean up after last test
      return await supertest.delete('/api/sample_tasks').set('kbn-xsrf', 'xxx').expect(200);
    });

    function currentTasks<State = unknown, Params = unknown>(): Promise<{
      docs: Array<SerializedConcreteTaskInstance<State, Params>>;
    }> {
      return supertest
        .get('/api/sample_tasks')
        .expect(200)
        .then((response) => response.body);
    }

    function currentTask<State = unknown, Params = unknown>(
      task: string
    ): Promise<SerializedConcreteTaskInstance<State, Params>> {
      return supertest
        .get(`/api/sample_tasks/task/${task}`)
        .send({ task })
        .expect((response) => {
          expect(response.status).to.eql(200);
          expect(typeof JSON.parse(response.text).id).to.eql(`string`);
        })
        .then((response) => response.body);
    }

    function currentTaskError<State = unknown, Params = unknown>(
      task: string
    ): Promise<{
      statusCode: number;
      error: string;
      message: string;
    }> {
      return supertest
        .get(`/api/sample_tasks/task/${task}`)
        .send({ task })
        .expect(function (response) {
          expect(response.status).to.eql(200);
          expect(typeof JSON.parse(response.text).message).to.eql(`string`);
        })
        .then((response) => response.body);
    }

    function ensureTasksIndexRefreshed() {
      return supertest.get(`/api/ensure_tasks_index_refreshed`).send({}).expect(200);
    }

    async function historyDocs(taskId?: string): Promise<RawDoc[]> {
      return es
        .search({
          index: testHistoryIndex,
          query: {
            term: { type: 'task' },
          },
        })
        .then((result) =>
          (result as unknown as SearchResults).hits.hits.filter((task) =>
            taskId ? task._source?.taskId === taskId : true
          )
        );
    }

    function scheduleTask(
      task: Partial<ConcreteTaskInstance | DeprecatedConcreteTaskInstance>
    ): Promise<SerializedConcreteTaskInstance> {
      return supertest
        .post('/api/sample_tasks/schedule')
        .set('kbn-xsrf', 'xxx')
        .send({ task })
        .expect(200)
        .then((response: { body: SerializedConcreteTaskInstance }) => {
          log.debug(`Task Scheduled: ${response.body.id}`);
          return response.body;
        });
    }

    function scheduleTaskWithApiKey(
      task: Partial<ConcreteTaskInstance | DeprecatedConcreteTaskInstance>
    ): Promise<SerializedConcreteTaskInstance> {
      return supertest
        .post('/api/sample_tasks/schedule_with_api_key')
        .set('kbn-xsrf', 'xxx')
        .send({ task })
        .expect(200)
        .then((response: { body: SerializedConcreteTaskInstance }) => {
          log.debug(`Task Scheduled: ${response.body.id}`);
          return response.body;
        });
    }

    function runTaskSoon(task: { id: string }) {
      return supertest
        .post('/api/sample_tasks/run_soon')
        .set('kbn-xsrf', 'xxx')
        .send({ task })
        .expect(200)
        .then((response) => response.body);
    }

    function bulkEnable(taskIds: string[], runSoon: boolean) {
      return supertest
        .post('/api/sample_tasks/bulk_enable')
        .set('kbn-xsrf', 'xxx')
        .send({ taskIds, runSoon })
        .expect(200)
        .then((response) => response.body);
    }

    function bulkDisable(taskIds: string[]) {
      return supertest
        .post('/api/sample_tasks/bulk_disable')
        .set('kbn-xsrf', 'xxx')
        .send({ taskIds })
        .expect(200)
        .then((response) => response.body);
    }

    function bulkUpdateSchedules(taskIds: string[], schedule: { interval: string }) {
      return supertest
        .post('/api/sample_tasks/bulk_update_schedules')
        .set('kbn-xsrf', 'xxx')
        .send({ taskIds, schedule })
        .expect(200)
        .then((response: { body: BulkUpdateTaskResult }) => response.body);
    }

    function scheduleTaskIfNotExists(task: Partial<ConcreteTaskInstance>) {
      return supertest
        .post('/api/sample_tasks/ensure_scheduled')
        .set('kbn-xsrf', 'xxx')
        .send({ task })
        .expect(200)
        .then((response: { body: ConcreteTaskInstance }) => response.body);
    }

    function releaseTasksWaitingForEventToComplete(event: string) {
      return supertest
        .post('/api/sample_tasks/event')
        .set('kbn-xsrf', 'xxx')
        .send({ event })
        .expect(200);
    }

    function getTaskById<State = unknown, Params = unknown>(
      tasks: Array<SerializedConcreteTaskInstance<State, Params>>,
      id: string
    ) {
      return tasks.filter((task) => task.id === id)[0];
    }

    async function provideParamsToTasksWaitingForParams(
      taskId: string,
      data: Record<string, unknown> = {}
    ) {
      // wait for task to start running and stall on waitForParams
      await retry.try(async () => {
        const tasks = (await currentTasks()).docs;
        expect(getTaskById(tasks, taskId).status).to.eql('running');
      });

      return supertest
        .post('/api/sample_tasks/event')
        .set('kbn-xsrf', 'xxx')
        .send({ event: taskId, data })
        .expect(200);
    }
    it('should schedule a task with rrule', async () => {
      const dailyTask = await scheduleTask({
        id: 'sample-recurring-task-id',
        taskType: 'sampleRecurringTask',
        schedule: { rrule: { freq: Frequency.DAILY, tzid: 'UTC', interval: 1 } },
        params: {},
      });

      await retry.try(async () => {
        const history = await historyDocs();
        expect(history.length).to.eql(1);
      });

      await retry.try(async () => {
        const task = await currentTask(dailyTask.id);
        expect(task.status).to.be('idle');
        const runAt = new Date(task.runAt).getTime();
        const scheduledAt = new Date(task.scheduledAt).getTime();
        // scheduled to run 24 hours from now
        expect(runAt).to.greaterThan(scheduledAt + 1000 * 59 * 60 * 24);
        expect(runAt).to.lessThan(scheduledAt + 1000 * 61 * 60 * 24);
      });
    });

    it('should schedule a task with rrule with fixed time', async () => {
      const dailyTask = await scheduleTask({
        id: 'sample-recurring-task-id',
        taskType: 'sampleRecurringTask',
        schedule: {
          rrule: { freq: Frequency.DAILY, tzid: 'UTC', interval: 1, byhour: [15], byminute: [27] },
        },
        params: {},
      });

      await retry.try(async () => {
        const task = await currentTask(dailyTask.id);
        expect(task.status).to.be('idle');
        const runAt = new Date(task.runAt);
        expect(runAt.getUTCHours()).to.be(15);
        expect(runAt.getUTCMinutes()).to.be(27);
      });

      // should not run immediately as the task is scheduled to run at 15:27 UTC
      expect((await historyDocs()).length).to.eql(0);
    });

    it('should schedule a task with rrule with fixed time and dtstart', async () => {
      const now = new Date();
      const todayDay = now.getUTCDate();
      const todayMonth = now.getUTCMonth();
      // set a start date for 2 days from now
      const startDate = moment(now).add(2, 'days').toDate();
      const dailyTask = await scheduleTask({
        id: 'sample-recurring-task-id',
        taskType: 'sampleRecurringTask',
        schedule: {
          rrule: {
            dtstart: startDate.toISOString(),
            freq: Frequency.DAILY,
            tzid: 'UTC',
            interval: 1,
            byhour: [15],
            byminute: [27],
          },
        },
        params: {},
      });

      await retry.try(async () => {
        const task = await currentTask(dailyTask.id);
        expect(task.status).to.be('idle');
        const runAt = new Date(task.runAt);

        const runAtDay = runAt.getUTCDate();
        const runAtMonth = runAt.getUTCMonth();
        if (todayMonth === runAtMonth) {
          expect(runAtDay >= todayDay + 2).to.be(true);
        } else if (todayMonth < runAtMonth) {
          log.info(`todayMonth: ${todayMonth}, runAtMonth: ${runAtMonth}`);
        } else {
          throw new Error(
            `Unexpected result: todayMonth:[${todayMonth}] > runAtMonth:[${runAtMonth}]`
          );
        }
        expect(runAt.getUTCHours()).to.be(15);
        expect(runAt.getUTCMinutes()).to.be(27);
      });

      // should not run immediately as the task is scheduled to run at 15:27 UTC
      expect((await historyDocs()).length).to.eql(0);
    });

    it('should not schedule a task with invalid rrule config', async () => {
      await supertest
        .post('/api/sample_tasks/schedule')
        .set('kbn-xsrf', 'xxx')
        .send({
          id: 'sample-recurring-task-id',
          taskType: 'sampleRecurringTask',
          schedule: {
            rrule: {
              freq: Frequency.DAILY,
              interval: 1,
              byhour: [30], // invalid
              byminute: [27],
            },
          },
          params: {},
        })
        .expect(400);
    });

    it('should support middleware', async () => {
      const historyItem = random(1, 100);

      const scheduledTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '30m' },
        params: { historyItem },
      });
      log.debug(`Task created: ${scheduledTask.id}`);

      await retry.try(async () => {
        expect((await historyDocs()).length).to.eql(1);

        const [task] = (await currentTasks<{ count: number }>()).docs;
        log.debug(`Task found: ${task.id}`);
        log.debug(`Task status: ${task.status}`);
        log.debug(`Task state: ${JSON.stringify(task.state, null, 2)}`);
        log.debug(`Task params: ${JSON.stringify(task.params, null, 2)}`);

        expect(task.state.count).to.eql(1);

        expect(task.params).to.eql({
          superFly: 'My middleware param!',
          originalParams: { historyItem },
        });
      });
    });

    it('should remove non-recurring tasks after they complete', async () => {
      await scheduleTask({
        taskType: 'sampleTask',
        params: {},
      });

      await retry.try(async () => {
        const history = await historyDocs();
        expect(history.length).to.eql(1);
        expect((await currentTasks()).docs).to.eql([]);
      });
    });

    it('should remove recurring task if task requests deletion', async () => {
      await scheduleTask({
        taskType: 'sampleRecurringTaskThatDeletesItself',
        schedule: { interval: '1s' },
        params: {},
      });

      await retry.try(async () => {
        const history = await historyDocs();
        expect(history.length).to.eql(5);
        expect((await currentTasks()).docs).to.eql([]);
      });
    });

    it('should use a given ID as the task document ID', async () => {
      const result = await scheduleTask({
        id: 'test-task-for-sample-task-plugin-to-test-task-manager',
        taskType: 'sampleTask',
        params: {},
      });

      expect(result.id).to.be('test-task-for-sample-task-plugin-to-test-task-manager');
    });

    it('should allow a task with a given ID to be scheduled multiple times', async () => {
      const result = await scheduleTaskIfNotExists({
        id: 'test-task-to-reschedule-in-task-manager',
        taskType: 'sampleTask',
        params: {},
      });

      expect(result.id).to.be('test-task-to-reschedule-in-task-manager');

      const rescheduleResult = await scheduleTaskIfNotExists({
        id: 'test-task-to-reschedule-in-task-manager',
        taskType: 'sampleTask',
        params: {},
      });

      expect(rescheduleResult.id).to.be('test-task-to-reschedule-in-task-manager');
    });

    it('should reschedule if task errors', async () => {
      const task = await scheduleTask({
        taskType: 'sampleTask',
        params: { failWith: 'Dangit!!!!!' },
      });

      await retry.try(async () => {
        const scheduledTask = await currentTask(task.id);
        expect(scheduledTask.attempts).to.be.greaterThan(1);
        expect(Date.parse(scheduledTask.runAt)).to.be.greaterThan(
          Date.parse(task.runAt) + 30 * 1000
        );
      });
    });

    it('should schedule the retry of recurring tasks to run at the next schedule when they time out', async () => {
      const intervalInMinutes = 30;
      const intervalInMilliseconds = intervalInMinutes * 60 * 1000;
      const task = await scheduleTask({
        taskType: 'sampleRecurringTaskWhichHangs',
        schedule: { interval: `${intervalInMinutes}m` },
        params: {},
      });

      await retry.try(async () => {
        const scheduledTask = await currentTask(task.id);
        const retryAt = Date.parse(scheduledTask.retryAt!);
        expect(isNaN(retryAt)).to.be(false);

        const buffer = 10000; // 10 second buffer
        const retryDelay = retryAt - Date.parse(task.runAt);
        expect(retryDelay).to.be.greaterThan(intervalInMilliseconds - buffer);
        expect(retryDelay).to.be.lessThan(intervalInMilliseconds + buffer);
      });
    });

    it('should reschedule if task returns runAt', async () => {
      const nextRunMilliseconds = random(60000, 200000);
      const count = random(1, 20);

      const originalTask = await scheduleTask({
        taskType: 'sampleTask',
        params: { nextRunMilliseconds },
        state: { count },
      });

      await retry.try(async () => {
        expect((await historyDocs(originalTask.id)).length).to.eql(1);

        const task = await currentTask<{ count: number }>(originalTask.id);
        expect(task.attempts).to.eql(0);
        expect(task.state.count).to.eql(count + 1);

        expectReschedule(Date.parse(originalTask.runAt), task, nextRunMilliseconds);
      });
    });

    it('should reschedule if task has an interval', async () => {
      const interval = random(5, 200);
      const intervalMilliseconds = interval * 60000;

      const originalTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: `${interval}m` },
        params: {},
      });

      await retry.try(async () => {
        expect((await historyDocs()).length).to.eql(1);

        const [task] = (await currentTasks<{ count: number }>()).docs;
        expect(task.attempts).to.eql(0);
        expect(task.state.count).to.eql(1);

        expectReschedule(Date.parse(originalTask.runAt), task, intervalMilliseconds);
      });
    });

    it('should support the deprecated interval field', async () => {
      const interval = random(5, 200);
      const intervalMilliseconds = interval * 60000;

      const originalTask = await scheduleTask({
        taskType: 'sampleTask',
        interval: `${interval}m`,
        params: {},
      });

      await retry.try(async () => {
        expect((await historyDocs()).length).to.eql(1);

        const [task] = (await currentTasks<{ count: number }>()).docs;
        expect(task.attempts).to.eql(0);
        expect(task.state.count).to.eql(1);

        expectReschedule(Date.parse(originalTask.runAt), task, intervalMilliseconds);
      });
    });

    it('should schedule tasks with API keys if request is provided', async () => {
      let queryResult = await supertest
        .post('/internal/security/api_key/_query')
        .send({})
        .set('kbn-xsrf', 'xxx')
        .expect(200);

      const apiKeysLength = queryResult.body.apiKeys.length;

      await scheduleTaskWithApiKey({
        id: 'test-task-for-sample-task-plugin-to-test-task-api-key',
        taskType: 'sampleTask',
        params: {},
      });

      const result = await currentTask('test-task-for-sample-task-plugin-to-test-task-api-key');

      expect(result.apiKey).not.empty();

      queryResult = await supertest
        .post('/internal/security/api_key/_query')
        .send({})
        .set('kbn-xsrf', 'xxx')
        .expect(200);

      expect(
        queryResult.body.apiKeys.filter((apiKey: { id: string }) => {
          return apiKey.id === result.userScope?.apiKeyId;
        }).length
      ).eql(1);

      expect(queryResult.body.apiKeys.length).eql(apiKeysLength + 1);

      await supertest.delete('/api/sample_tasks').set('kbn-xsrf', 'xxx').expect(200);

      queryResult = await supertest
        .post('/internal/security/api_key/_query')
        .send({})
        .set('kbn-xsrf', 'xxx')
        .expect(200);

      expect(
        queryResult.body.apiKeys.filter((apiKey: { id: string }) => {
          return apiKey.id === result.userScope?.apiKeyId;
        }).length
      ).eql(0);

      expect(queryResult.body.apiKeys.length).eql(apiKeysLength);
    });

    it('should return a task run result when asked to run a task now', async () => {
      const originalTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: `30m` },
        params: {},
      });

      await retry.try(async () => {
        const docs = await historyDocs();
        expect(docs.filter((taskDoc) => taskDoc._source.taskId === originalTask.id).length).to.eql(
          1
        );

        const [task] = (await currentTasks<{ count: number }>()).docs.filter(
          (taskDoc) => taskDoc.id === originalTask.id
        );

        expect(task.state.count).to.eql(1);

        // ensure this task shouldnt run for another half hour
        expectReschedule(Date.parse(originalTask.runAt), task, 30 * 60000);
      });

      const now = Date.now();
      const runSoonResult = await runTaskSoon({
        id: originalTask.id,
      });

      expect(runSoonResult).to.eql({ id: originalTask.id });

      await retry.try(async () => {
        expect(
          (await historyDocs()).filter((taskDoc) => taskDoc._source.taskId === originalTask.id)
            .length
        ).to.eql(2);

        const [task] = (await currentTasks<{ count: number }>()).docs.filter(
          (taskDoc) => taskDoc.id === originalTask.id
        );
        expect(task.state.count).to.eql(2);

        // ensure this task shouldnt run for another half hour
        expectReschedule(now, task, 30 * 60000);
      });
    });

    it('should only run as many instances of a task as its maxConcurrency will allow', async () => {
      // should run as there's only one and maxConcurrency on this TaskType is 1
      const firstWithSingleConcurrency = await scheduleTask({
        taskType: 'sampleTaskWithSingleConcurrency',
        params: {
          waitForEvent: 'releaseFirstWaveOfTasks',
        },
      });

      // should run as there's only two and maxConcurrency on this TaskType is 2
      const [firstLimitedConcurrency, secondLimitedConcurrency] = await Promise.all([
        scheduleTask({
          taskType: 'sampleTaskWithLimitedConcurrency',
          params: {
            waitForEvent: 'releaseFirstWaveOfTasks',
          },
        }),
        scheduleTask({
          taskType: 'sampleTaskWithLimitedConcurrency',
          params: {
            waitForEvent: 'releaseSecondWaveOfTasks',
          },
        }),
      ]);

      await retry.try(async () => {
        expect((await historyDocs(firstWithSingleConcurrency.id)).length).to.eql(1);
        expect((await historyDocs(firstLimitedConcurrency.id)).length).to.eql(1);
        expect((await historyDocs(secondLimitedConcurrency.id)).length).to.eql(1);
      });

      // should not run as there one running and maxConcurrency on this TaskType is 1
      const secondWithSingleConcurrency = await scheduleTask({
        taskType: 'sampleTaskWithSingleConcurrency',
        params: {
          waitForEvent: 'releaseSecondWaveOfTasks',
        },
      });

      // should not run as there are two running and maxConcurrency on this TaskType is 2
      const thirdWithLimitedConcurrency = await scheduleTask({
        taskType: 'sampleTaskWithLimitedConcurrency',
        params: {
          waitForEvent: 'releaseSecondWaveOfTasks',
        },
      });

      // schedule a task that should get picked up before the two blocked tasks
      const taskWithUnlimitedConcurrency = await scheduleTask({
        taskType: 'sampleTask',
        params: {},
      });

      await retry.try(async () => {
        expect((await historyDocs(taskWithUnlimitedConcurrency.id)).length).to.eql(1);
        expect((await currentTask(secondWithSingleConcurrency.id)).status).to.eql('idle');
        expect((await currentTask(thirdWithLimitedConcurrency.id)).status).to.eql('idle');
      });

      // release the running SingleConcurrency task and only one of the LimitedConcurrency tasks
      await releaseTasksWaitingForEventToComplete('releaseFirstWaveOfTasks');

      await retry.try(async () => {
        // ensure the completed tasks were deleted
        expect((await currentTaskError(firstWithSingleConcurrency.id)).message).to.eql(
          `Saved object [task/${firstWithSingleConcurrency.id}] not found`
        );
        expect((await currentTaskError(firstLimitedConcurrency.id)).message).to.eql(
          `Saved object [task/${firstLimitedConcurrency.id}] not found`
        );

        // ensure blocked tasks is still running
        expect((await currentTask(secondLimitedConcurrency.id)).status).to.eql('running');

        // ensure the blocked tasks begin running
        expect((await currentTask(secondWithSingleConcurrency.id)).status).to.eql('running');
        expect((await currentTask(thirdWithLimitedConcurrency.id)).status).to.eql('running');
      });

      // release blocked task
      await releaseTasksWaitingForEventToComplete('releaseSecondWaveOfTasks');
    });

    it('should only run as many instances of a task as its shared maxConcurrency will allow', async () => {
      // should run as maxConcurrency on this taskType is 1
      const firstWithSharedConcurrency = await scheduleTask({
        taskType: 'sampleTaskSharedConcurrencyType1',
        params: {
          waitForEvent: 'releaseFirstWaveOfTasks',
        },
      });

      await retry.try(async () => {
        expect((await historyDocs(firstWithSharedConcurrency.id)).length).to.eql(1);
      });

      // should not run as there is a task with shared concurrency running
      const secondWithSharedConcurrency = await scheduleTask({
        taskType: 'sampleTaskSharedConcurrencyType2',
        params: {
          waitForEvent: 'releaseSecondWaveOfTasks',
        },
      });

      // schedule a task that should get picked up before the blocked task
      const taskWithUnlimitedConcurrency = await scheduleTask({
        taskType: 'sampleTask',
        params: {},
      });

      await retry.try(async () => {
        expect((await historyDocs(taskWithUnlimitedConcurrency.id)).length).to.eql(1);
        expect((await currentTask(secondWithSharedConcurrency.id)).status).to.eql('idle');
      });

      // release the running SingleConcurrency task and only one of the LimitedConcurrency tasks
      await releaseTasksWaitingForEventToComplete('releaseFirstWaveOfTasks');

      await retry.try(async () => {
        // ensure the completed tasks were deleted
        expect((await currentTaskError(firstWithSharedConcurrency.id)).message).to.eql(
          `Saved object [task/${firstWithSharedConcurrency.id}] not found`
        );

        // ensure the blocked tasks begin running
        expect((await currentTask(secondWithSharedConcurrency.id)).status).to.eql('running');
      });

      // release blocked task
      await releaseTasksWaitingForEventToComplete('releaseSecondWaveOfTasks');
    });

    it('should return a task run error result when trying to run a non-existent task', async () => {
      // runSoon should fail
      const failedRunSoonResult = await runTaskSoon({
        id: 'i-dont-exist',
      });
      expect(failedRunSoonResult).to.eql({
        error: `Error: Saved object [task/i-dont-exist] not found`,
        id: 'i-dont-exist',
      });
    });

    it('should return a task run error result when trying to run a task now which is already running', async () => {
      const longRunningTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '30m' },
        params: {
          waitForParams: true,
        },
      });

      // tell the task to wait for the 'runSoonHasBeenAttempted' event
      await provideParamsToTasksWaitingForParams(longRunningTask.id, {
        waitForEvent: 'runSoonHasBeenAttempted',
      });

      await retry.try(async () => {
        const docs = await historyDocs();
        expect(
          docs.filter((taskDoc) => taskDoc._source.taskId === longRunningTask.id).length
        ).to.eql(1);

        const task = await currentTask(longRunningTask.id);
        expect(task.status).to.eql('running');
      });

      await ensureTasksIndexRefreshed();

      // first runSoon should fail
      const failedRunSoonResult = await runTaskSoon({
        id: longRunningTask.id,
      });

      expect(failedRunSoonResult).to.eql({
        error: `Error: Failed to run task "${longRunningTask.id}" as it is currently running`,
        id: longRunningTask.id,
      });

      // finish first run by emitting 'runSoonHasBeenAttempted' event
      await releaseTasksWaitingForEventToComplete('runSoonHasBeenAttempted');
      await retry.try(async () => {
        const tasks = (await currentTasks<{ count: number }>()).docs;
        expect(getTaskById(tasks, longRunningTask.id).state.count).to.eql(1);

        const task = await currentTask(longRunningTask.id);
        expect(task.status).to.eql('idle');
      });

      await ensureTasksIndexRefreshed();

      // second runSoon should be successful
      const successfulRunSoonResult = runTaskSoon({
        id: longRunningTask.id,
      });

      await provideParamsToTasksWaitingForParams(longRunningTask.id);

      expect(await successfulRunSoonResult).to.eql({ id: longRunningTask.id });
    });

    it('should disable and reenable task and run it when runSoon = true', async () => {
      const historyItem = random(1, 100);
      const scheduledTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '1h' },
        params: { historyItem },
      });

      await retry.try(async () => {
        expect((await historyDocs()).length).to.eql(1);
        const task = await currentTask(scheduledTask.id);

        expect(task.enabled).to.eql(true);
      });

      await retry.try(async () => {
        // disable the task
        await bulkDisable([scheduledTask.id]);
        const task = await currentTask(scheduledTask.id);
        log.debug(
          `bulkDisable:task(${scheduledTask.id}) enabled: ${task.enabled}, when runSoon = true`
        );
        expect(task.enabled).to.eql(false);
      });

      // re-enable the task
      await bulkEnable([scheduledTask.id], true);

      await retry.try(async () => {
        const task = await currentTask(scheduledTask.id);

        expect(task.enabled).to.eql(true);
        log.debug(
          `bulkEnable:task(${scheduledTask.id}) enabled: ${task.enabled}, when runSoon = true`
        );
        expect(Date.parse(task.scheduledAt)).to.be.greaterThan(
          Date.parse(scheduledTask.scheduledAt)
        );
        expect(Date.parse(task.runAt)).to.be.greaterThan(Date.parse(scheduledTask.runAt));
      });
    });

    it('should disable and reenable task and not run it when runSoon = false', async () => {
      const historyItem = random(1, 100);
      const scheduledTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '1h' },
        params: { historyItem },
      });

      await retry.try(async () => {
        expect((await historyDocs()).length).to.eql(1);

        const task = await currentTask(scheduledTask.id);
        expect(task.enabled).to.eql(true);
      });

      // disable the task
      await bulkDisable([scheduledTask.id]);

      let disabledTask: SerializedConcreteTaskInstance;
      await retry.try(async () => {
        disabledTask = await currentTask(scheduledTask.id);
        log.debug(
          `bulkDisable:task(${scheduledTask.id}) enabled: ${disabledTask.enabled}, when runSoon = false`
        );
        expect(disabledTask.enabled).to.eql(false);
      });

      // re-enable the task
      await bulkEnable([scheduledTask.id], false);

      await retry.try(async () => {
        const task = await currentTask(scheduledTask.id);
        log.debug(
          `bulkEnable:task(${scheduledTask.id}) enabled: ${task.enabled}, when runSoon = true`
        );
        expect(task.enabled).to.eql(true);
        expect(Date.parse(task.scheduledAt)).to.eql(Date.parse(disabledTask.scheduledAt));
      });
    });

    function expectReschedule(
      originalRunAt: number,
      task: SerializedConcreteTaskInstance<any, any>,
      expectedDiff: number
    ) {
      const buffer = 10000;
      expect(Date.parse(task.runAt) - originalRunAt).to.be.greaterThan(expectedDiff - buffer);
      expect(Date.parse(task.runAt) - originalRunAt).to.be.lessThan(expectedDiff + buffer);
    }

    it('should run tasks in parallel, allowing for long running tasks along side faster tasks', async () => {
      /**
       * It's worth noting this test relies on the /event endpoint that forces Task Manager to hold off
       * on completing a task until a call is made by the test suite.
       * If we begin testing with multiple Kibana instacnes in Parallel this will likely become flaky.
       * If you end up here because the test is flaky, this might be why.
       */
      const fastTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: `1s` },
        params: {},
      });

      const longRunningTask = await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: `1s` },
        params: {
          waitForEvent: 'rescheduleHasHappened',
        },
      });

      await retry.try(async () => {
        const tasks = (await currentTasks<{ count: number }>()).docs;
        expect(getTaskById(tasks, fastTask.id).state.count).to.eql(2);
      });

      await releaseTasksWaitingForEventToComplete('rescheduleHasHappened');

      await retry.try(async () => {
        const tasks = (await currentTasks<{ count: number }>()).docs;

        expect(getTaskById(tasks, fastTask.id).state.count).to.greaterThan(2);
        expect(getTaskById(tasks, longRunningTask.id).state.count).to.eql(1);
      });
    });

    it('should delete the task if it is still running but maxAttempts has been reached', async () => {
      await scheduleTask({
        taskType: 'sampleOneTimeTaskThrowingError',
        params: {},
      });

      await retry.try(async () => {
        const results = (await currentTasks()).docs;
        expect(results.length).to.eql(0);
      });
    });

    it('should continue claiming recurring task even if maxAttempts has been reached', async () => {
      const task = await scheduleTask({
        taskType: 'sampleRecurringTaskTimingOut',
        schedule: { interval: '1s' },
        params: {},
      });

      await retry.try(async () => {
        const [scheduledTask] = (await currentTasks()).docs;
        expect(scheduledTask.id).to.eql(task.id);
        expect(['claiming', 'running'].includes(scheduledTask.status)).to.be(true);
        expect(scheduledTask.attempts).to.be.greaterThan(3);
      });
    });

    it('should fail to schedule recurring task with timeout override', async () => {
      const task = await scheduleTask({
        taskType: 'sampleRecurringTaskTimingOut',
        schedule: { interval: '1s' },
        timeoutOverride: '30s',
        params: {},
      });

      expect(task.timeoutOverride).to.be(undefined);
    });

    it('should allow timeout override for ad hoc tasks', async () => {
      const task = await scheduleTask({
        taskType: 'sampleAdHocTaskTimingOut',
        timeoutOverride: '30s',
        params: {},
      });

      expect(task.timeoutOverride).to.be('30s');

      // this task type is set to time out after 1s but the task runner
      // will wait 15 seconds and then index a document if it hasn't timed out
      // this test overrides the timeout to 30s and checks if the expected
      // document was indexed. presence of indexed document means the task
      // timeout override was respected
      await retry.try(async () => {
        const [scheduledTask] = (await currentTasks()).docs;
        expect(scheduledTask?.id).to.eql(task.id);
      });

      await retry.try(async () => {
        const docs: RawDoc[] = await historyDocs(task.id);
        expect(docs.length).to.eql(1);
        expect(docs[0]._source.taskType).to.eql('sampleAdHocTaskTimingOut');
      });
    });

    it('should bulk update schedules for multiple tasks', async () => {
      const initialTime = Date.now();
      const tasks = await Promise.all([
        scheduleTask({
          taskType: 'sampleTask',
          schedule: { interval: '1h' },
          params: {},
        }),

        scheduleTask({
          taskType: 'sampleTask',
          schedule: { interval: '5m' },
          params: {},
        }),
      ]);

      const taskIds = tasks.map(({ id }) => id);

      await retry.try(async () => {
        // ensure each task has ran at least once and been rescheduled for future run
        for (const task of tasks) {
          const { state } = await currentTask<{ count: number }>(task.id);
          expect(state.count).to.be(1);
        }

        // first task to be scheduled in 1h
        expect(Date.parse((await currentTask(tasks[0].id)).runAt) - initialTime).to.be.greaterThan(
          moment.duration(1, 'hour').asMilliseconds()
        );

        // second task to be scheduled in 5m
        expect(Date.parse((await currentTask(tasks[1].id)).runAt) - initialTime).to.be.greaterThan(
          moment.duration(5, 'minutes').asMilliseconds()
        );
      });

      await retry.try(async () => {
        const updates = await bulkUpdateSchedules(taskIds, { interval: '3h' });

        expect(updates.tasks.length).to.be(2);
        expect(updates.errors.length).to.be(0);
      });

      await retry.try(async () => {
        const updatedTasks = (await currentTasks()).docs;

        updatedTasks.forEach((task) => {
          expect(task.schedule).to.eql({ interval: '3h' });
          // should be scheduled to run in 3 hours
          expect(Date.parse(task.runAt) - initialTime).to.be.greaterThan(
            moment.duration(3, 'hours').asMilliseconds()
          );
        });
      });
    });

    it('should not bulk update schedules for task in running status', async () => {
      // this task should be in running status for 60s until it will be time outed
      const longRunningTask = await scheduleTask({
        taskType: 'sampleRecurringTaskWhichHangs',
        schedule: { interval: '1h' },
        params: {},
      });

      await runTaskSoon({ id: longRunningTask.id });

      let scheduledRunAt: string;
      // ensure task is running and store scheduled runAt
      await retry.try(async () => {
        const task = await currentTask(longRunningTask.id);

        expect(task.status).to.be('running');

        scheduledRunAt = task.runAt;
      });

      await retry.try(async () => {
        const updates = await bulkUpdateSchedules([longRunningTask.id], { interval: '3h' });

        // length should be 0, as task in running status won't be updated
        expect(updates.tasks.length).to.be(0);
        expect(updates.errors.length).to.be(0);
      });

      // ensure task wasn't updated
      await retry.try(async () => {
        const task = await currentTask(longRunningTask.id);

        // interval shouldn't be changed
        expect(task.schedule).to.eql({ interval: '1h' });

        // scheduledRunAt shouldn't be changed
        expect(task.runAt).to.eql(scheduledRunAt);
      });
    });

    it('should set status of recurring task back to idle when schedule interval is greater than timeout', async () => {
      const task = await scheduleTask({
        taskType: 'sampleRecurringTaskTimingOut',
        schedule: { interval: '1d' },
        params: {},
      });

      await retry.try(async () => {
        const [scheduledTask] = (await currentTasks()).docs;
        expect(scheduledTask.id).to.eql(task.id);
        expect(scheduledTask.status).to.be('running');
        expect(scheduledTask.startedAt).not.to.be(null);
        expect(scheduledTask.retryAt).not.to.be(null);
      });

      await retry.try(async () => {
        const [scheduledTask] = (await currentTasks()).docs;
        expect(scheduledTask.id).to.eql(task.id);
        expect(scheduledTask.status).to.be('idle');
        expect(scheduledTask.startedAt).to.be(null);
        expect(scheduledTask.retryAt).to.be(null);
      });
    });
  });
}
