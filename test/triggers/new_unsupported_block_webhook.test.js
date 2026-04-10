const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const trigger = App.triggers['new_unsupported_block_webhook'];

describe('triggers.new_unsupported_block_webhook', () => {
  describe('perform (webhook handler)', () => {
    const mockBlock = {
      object: 'block',
      id: 'block-aaaa-bbbb-cccc-dddddddddddd',
      type: 'unsupported',
      unsupported: { block_type: 'mail' },
      created_time: '2026-04-01T12:00:00.000Z',
      last_edited_time: '2026-04-01T12:01:00.000Z',
      created_by: { object: 'user', id: 'user-1' },
      last_edited_by: { object: 'user', id: 'user-1' },
      has_children: false,
      in_trash: false,
      parent: { type: 'page_id', page_id: 'page-aaaa-bbbb-cccc-dddddddddddd' },
    };

    const mockPage = {
      id: 'page-aaaa-bbbb-cccc-dddddddddddd',
      url: 'https://www.notion.so/pageaaaabbbbccccdddddddddddd',
    };

    const makeBundle = (event, inputData = {}) => ({
      inputData: {
        data_source_id: 'ds-2222',
        block_type: 'mail',
        ...inputData,
      },
      cleanedRequest: event,
    });

    const makeEvent = (overrides = {}) => ({
      type: 'page.content_updated',
      entity: { type: 'page', id: 'page-aaaa-bbbb-cccc-dddddddddddd' },
      data: {
        parent: { type: 'database', id: 'db-1', data_source_id: 'ds-2222' },
        updated_blocks: [
          { id: 'block-aaaa-bbbb-cccc-dddddddddddd', type: 'block' },
        ],
      },
      ...overrides,
    });

    it('should return matching unsupported blocks from webhook event', async () => {
      const nock = require('nock');
      nock('https://api.notion.com')
        .get('/v1/blocks/block-aaaa-bbbb-cccc-dddddddddddd')
        .reply(200, mockBlock);
      nock('https://api.notion.com')
        .get('/v1/pages/page-aaaa-bbbb-cccc-dddddddddddd')
        .reply(200, mockPage);

      const bundle = makeBundle(makeEvent());
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(1);
      expect(results[0].block_type).toBe('mail');
      expect(results[0].id).toBe('block-aaaa-bbbb-cccc-dddddddddddd');
      expect(results[0].block_url).toBe(
        'https://www.notion.so/pageaaaabbbbccccdddddddddddd#blockaaaabbbbccccdddddddddddd',
      );
      expect(results[0].parent_page_id).toBe('page-aaaa-bbbb-cccc-dddddddddddd');
      expect(results[0]).toHaveProperty('created_time');
      expect(results[0]).toHaveProperty('last_edited_time');
      expect(results[0]).toHaveProperty('has_children');
      // Should NOT include full block spread — only selected fields
      expect(results[0]).not.toHaveProperty('object');
      expect(results[0]).not.toHaveProperty('unsupported');

      nock.cleanAll();
    });

    it('should skip blocks that are not unsupported type', async () => {
      const nock = require('nock');
      nock('https://api.notion.com')
        .get('/v1/blocks/block-aaaa-bbbb-cccc-dddddddddddd')
        .reply(200, { ...mockBlock, type: 'paragraph', unsupported: undefined });

      const bundle = makeBundle(makeEvent());
      const results = await appTester(trigger.operation.perform, bundle);

      expect(results).toHaveLength(0);

      nock.cleanAll();
    });

    it('should skip unsupported blocks with wrong block_type', async () => {
      const nock = require('nock');
      nock('https://api.notion.com')
        .get('/v1/blocks/block-aaaa-bbbb-cccc-dddddddddddd')
        .reply(200, { ...mockBlock, unsupported: { block_type: 'other' } });

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
  });

  describe('performList (polling fallback)', () => {
    it('should return mail blocks via polling', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          data_source_id: '1e491b07-11ac-80ce-8b86-000b29ba4f68',
          block_type: 'mail',
        },
      };

      const results = await appTester(trigger.operation.performList, bundle);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].block_type).toBe('mail');
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('parent_page_id');
    });
  });
});
