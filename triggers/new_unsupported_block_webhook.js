const { subscribe, unsubscribe, fetchBlock, fetchPage } = require('../lib/webhook');
const { pollBlocks } = require('../lib/poll-blocks');

const performSubscribe = async (z, bundle) => {
  return subscribe(z, bundle.targetUrl, ['page.content_updated']);
};

const performUnsubscribe = async (z, bundle) => {
  await unsubscribe(z, bundle.subscribeData.id);
};

const perform = async (z, bundle) => {
  const { data_source_id, block_type } = bundle.inputData;
  const event = bundle.cleanedRequest;

  // Filter to events from the target data source
  if (data_source_id && event.data?.parent?.data_source_id !== data_source_id) {
    return [];
  }

  const updatedBlocks = event.data?.updated_blocks || [];
  const matchingBlocks = [];

  for (const ref of updatedBlocks) {
    if (ref.type !== 'block') continue;

    const block = await fetchBlock(z, ref.id);
    if (block.type !== 'unsupported' || block.unsupported?.block_type !== block_type) {
      continue;
    }

    const page = await fetchPage(z, event.entity.id);
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

  return matchingBlocks;
};

// Polling fallback for sample data in the Zap editor
const performList = async (z, bundle) => {
  const { data_source_id, block_type } = bundle.inputData;

  return pollBlocks(
    z,
    data_source_id,
    (block) =>
      block.type === 'unsupported' &&
      block.unsupported?.block_type === block_type,
    (block, page) => {
      const blockIdNoDashes = block.id.replace(/-/g, '');
      return {
        id: block.id,
        block_type: block.unsupported.block_type,
        block_url: `${page.url}#${blockIdNoDashes}`,
        parent_page_id: page.id,
        parent_page_url: page.url,
        created_time: block.created_time,
        last_edited_time: block.last_edited_time,
        has_children: block.has_children,
      };
    },
  );
};

module.exports = {
  key: 'new_unsupported_block_webhook',
  noun: 'Block',
  display: {
    label: 'New Unsupported Block (Instant)',
    description:
      'Triggers instantly when a new block of a specific unsupported type appears in a data source.',
  },
  operation: {
    type: 'hook',
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    inputFields: [
      {
        key: 'data_source_id',
        label: 'Data Source',
        type: 'string',
        required: true,
        dynamic: 'list_data_sources.id.title',
        helpText:
          'The data source (database view) to monitor for new blocks.',
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
      block_url:
        'https://www.notion.so/e62845894bb6442ea2676c1b8993df92#31f91b0711ac81fe942dcc675929c9dc',
      parent_page_id: 'e6284589-4bb6-442e-a267-6c1b8993df92',
      parent_page_url:
        'https://www.notion.so/e62845894bb6442ea2676c1b8993df92',
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
      {
        key: 'last_edited_time',
        label: 'Last Edited Time',
        type: 'datetime',
      },
      { key: 'has_children', label: 'Has Children', type: 'boolean' },
    ],
  },
};
