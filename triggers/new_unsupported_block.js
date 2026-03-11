const MAX_PAGES_TO_SCAN = 20;

const fetchChildBlocks = async (z, pageId) => {
  const blocks = [];
  let startCursor;

  do {
    const response = await z.request({
      url: `https://api.notion.com/v1/blocks/${pageId}/children`,
      params: {
        page_size: 100,
        ...(startCursor ? { start_cursor: startCursor } : {}),
      },
    });

    const data = response.data;
    blocks.push(...data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);

  return blocks;
};

const perform = async (z, bundle) => {
  const { data_source_id, block_type } = bundle.inputData;

  // Query the data source for recently created pages
  const queryResponse = await z.request({
    url: `https://api.notion.com/v1/data_sources/${data_source_id}/query`,
    method: 'POST',
    body: {
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: MAX_PAGES_TO_SCAN,
    },
  });

  const pages = queryResponse.data.results;
  const matchingBlocks = [];

  // Fetch child blocks for each page and filter for the target block type
  for (const page of pages) {
    const blocks = await fetchChildBlocks(z, page.id);

    for (const block of blocks) {
      if (
        block.type === 'unsupported' &&
        block.unsupported?.block_type === block_type
      ) {
        const blockIdNoDashes = block.id.replace(/-/g, '');
        matchingBlocks.push({
          id: block.id,
          block_type: block.unsupported.block_type,
          block_url: `${page.url}#${blockIdNoDashes}`,
          parent_page_id: page.id,
          parent_page_url: page.url,
          created_time: block.created_time,
          last_edited_time: block.last_edited_time,
          has_children: block.has_children,
        });
      }
    }
  }

  // Sort newest first for Zapier's deduper
  matchingBlocks.sort(
    (a, b) => new Date(b.created_time) - new Date(a.created_time),
  );

  return matchingBlocks;
};

module.exports = {
  key: 'new_unsupported_block',
  noun: 'Block',
  display: {
    label: 'New Unsupported Block',
    description:
      'Triggers when a new block of a specific unsupported type appears in a data source.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'data_source_id',
        label: 'Data Source',
        type: 'string',
        required: true,
        dynamic: 'list_data_sources.id.title',
        helpText: 'The data source (database view) to monitor for new blocks.',
      },
      {
        key: 'block_type',
        label: 'Unsupported Block Type',
        type: 'string',
        required: true,
        default: 'mail',
        helpText:
          'The unsupported block type to watch for (e.g. "mail"). This matches the `unsupported.block_type` field in the Notion API response.',
      },
    ],
    sample: {
      id: '31f91b07-11ac-81fe-942d-cc675929c9dc',
      block_type: 'mail',
      block_url: 'https://www.notion.so/e62845894bb6442ea2676c1b8993df92#31f91b0711ac81fe942dcc675929c9dc',
      parent_page_id: 'e6284589-4bb6-442e-a267-6c1b8993df92',
      parent_page_url: 'https://www.notion.so/e62845894bb6442ea2676c1b8993df92',
      created_time: '2026-03-10T10:06:00.000Z',
      last_edited_time: '2026-03-10T10:07:00.000Z',
      has_children: false,
    },
    outputFields: [
      { key: 'id', label: 'Block ID', type: 'string' },
      { key: 'block_type', label: 'Unsupported Block Type', type: 'string' },
      { key: 'block_url', label: 'Block URL', type: 'string' },
      { key: 'parent_page_id', label: 'Parent Page ID', type: 'string' },
      { key: 'parent_page_url', label: 'Parent Page URL', type: 'string' },
      { key: 'created_time', label: 'Created Time', type: 'datetime' },
      { key: 'last_edited_time', label: 'Last Edited Time', type: 'datetime' },
      { key: 'has_children', label: 'Has Children', type: 'boolean' },
    ],
  },
};
