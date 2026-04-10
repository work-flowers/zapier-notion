const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const search = App.searches['find_blocks_by_type'];

describe('searches.find_blocks_by_type', () => {
  const pageId = 'page-1111-2222-3333-444444444444';

  const mockPage = {
    id: pageId,
    url: 'https://www.notion.so/page111122223333444444444444',
  };

  const mockBlocks = [
    {
      object: 'block',
      id: 'block-aaaa-0000-0000-000000000001',
      type: 'meeting_notes',
      created_time: '2026-04-01T12:00:00.000Z',
      last_edited_time: '2026-04-01T12:01:00.000Z',
      has_children: true,
      in_trash: false,
    },
    {
      object: 'block',
      id: 'block-aaaa-0000-0000-000000000002',
      type: 'paragraph',
      created_time: '2026-04-01T12:02:00.000Z',
      last_edited_time: '2026-04-01T12:03:00.000Z',
      has_children: false,
      in_trash: false,
    },
    {
      object: 'block',
      id: 'block-aaaa-0000-0000-000000000003',
      type: 'meeting_notes',
      created_time: '2026-04-01T12:04:00.000Z',
      last_edited_time: '2026-04-01T12:05:00.000Z',
      has_children: true,
      in_trash: false,
    },
  ];

  afterEach(() => nock.cleanAll());

  it('should return only blocks matching the specified type', async () => {
    nock('https://api.notion.com')
      .get(`/v1/pages/${pageId}`)
      .reply(200, mockPage);
    nock('https://api.notion.com')
      .get(`/v1/blocks/${pageId}/children`)
      .query(true)
      .reply(200, { results: mockBlocks, has_more: false });

    const bundle = {
      inputData: { page_id: pageId, block_type: 'meeting_notes' },
    };

    const results = await appTester(search.operation.perform, bundle);

    expect(results).toHaveLength(2);
    expect(results[0].type).toBe('meeting_notes');
    expect(results[1].type).toBe('meeting_notes');
    expect(results[0]).toHaveProperty('block_url');
    expect(results[0]).toHaveProperty('parent_page_id', pageId);
    expect(results[0]).toHaveProperty('parent_page_url', mockPage.url);
  });

  it('should return empty array when no blocks match', async () => {
    nock('https://api.notion.com')
      .get(`/v1/pages/${pageId}`)
      .reply(200, mockPage);
    nock('https://api.notion.com')
      .get(`/v1/blocks/${pageId}/children`)
      .query(true)
      .reply(200, { results: mockBlocks, has_more: false });

    const bundle = {
      inputData: { page_id: pageId, block_type: 'callout' },
    };

    const results = await appTester(search.operation.perform, bundle);

    expect(results).toHaveLength(0);
  });

  it('should construct correct block URLs', async () => {
    nock('https://api.notion.com')
      .get(`/v1/pages/${pageId}`)
      .reply(200, mockPage);
    nock('https://api.notion.com')
      .get(`/v1/blocks/${pageId}/children`)
      .query(true)
      .reply(200, { results: [mockBlocks[0]], has_more: false });

    const bundle = {
      inputData: { page_id: pageId, block_type: 'meeting_notes' },
    };

    const results = await appTester(search.operation.perform, bundle);

    expect(results[0].block_url).toBe(
      'https://www.notion.so/page111122223333444444444444#blockaaaa00000000000000000001',
    );
  });
});
