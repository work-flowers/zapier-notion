const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const trigger = App.triggers['new_block_webhook'];

describe('triggers.new_block_webhook', () => {
  describe('perform (webhook handler)', () => {
    const mockBlock = {
      object: 'block',
      id: 'block-1111-2222-3333-444444444444',
      type: 'meeting_notes',
      created_time: '2026-04-01T12:00:00.000Z',
      last_edited_time: '2026-04-01T12:01:00.000Z',
      created_by: { object: 'user', id: 'user-1' },
      last_edited_by: { object: 'user', id: 'user-1' },
      has_children: true,
      in_trash: false,
      parent: { type: 'page_id', page_id: 'page-1111-2222-3333-444444444444' },
    };

    const mockPage = {
      id: 'page-1111-2222-3333-444444444444',
      url: 'https://www.notion.so/page111122223333444444444444',
    };

    const makeBundle = (event, inputData = {}) => ({
      inputData: {
        data_source_id: 'ds-1111',
        block_type: 'meeting_notes',
        ...inputData,
      },
      cleanedRequest: event,
    });

    const makeEvent = (overrides = {}) => ({
      type: 'page.content_updated',
      entity: { type: 'page', id: 'page-1111-2222-3333-444444444444' },
      data: {
        parent: { type: 'database', id: 'db-1', data_source_id: 'ds-1111' },
        updated_blocks: [
          { id: 'block-1111-2222-3333-444444444444', type: 'block' },
        ],
      },
      ...overrides,
    });

    it('should return matching blocks from webhook event', async () => {
      const nock = require('nock');
      nock('https://api.notion.com')
        .get('/v1/blocks/block-1111-2222-3333-444444444444')
        .reply(200, mockBlock);
      nock('https://api.notion.com')
        .get('/v1/pages/page-1111-2222-3333-444444444444')
        .reply(200, mockPage);

      const bundle = makeBundle(makeEvent());
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('meeting_notes');
      expect(results[0].block_url).toBe(
        'https://www.notion.so/page111122223333444444444444#block111122223333444444444444',
      );
      expect(results[0].parent_page_id).toBe('page-1111-2222-3333-444444444444');
      expect(results[0].parent_page_url).toBe(
        'https://www.notion.so/page111122223333444444444444',
      );

      nock.cleanAll();
    });

    it('should skip blocks that do not match block_type', async () => {
      const nock = require('nock');
      nock('https://api.notion.com')
        .get('/v1/blocks/block-1111-2222-3333-444444444444')
        .reply(200, { ...mockBlock, type: 'paragraph' });

      const bundle = makeBundle(makeEvent());
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(0);

      nock.cleanAll();
    });

    it('should skip events from a different data source', async () => {
      const event = makeEvent({
        data: {
          parent: { type: 'database', id: 'db-2', data_source_id: 'ds-other' },
          updated_blocks: [{ id: 'block-1', type: 'block' }],
        },
      });

      const bundle = makeBundle(event);
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(0);
    });

    it('should skip updated_blocks with type !== block', async () => {
      const event = makeEvent({
        data: {
          parent: { type: 'database', id: 'db-1', data_source_id: 'ds-1111' },
          updated_blocks: [{ id: 'page-nested', type: 'page' }],
        },
      });

      const bundle = makeBundle(event);
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(0);
    });
  });

  describe('performList (polling fallback)', () => {
    it('should return blocks via polling', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          data_source_id: '1e491b07-11ac-80ce-8b86-000b29ba4f68',
          block_type: 'paragraph',
        },
      };

      const results = await appTester(trigger.operation.performList, bundle);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('paragraph');
      expect(results[0]).toHaveProperty('block_url');
      expect(results[0]).toHaveProperty('parent_page_id');
    });
  });
});
