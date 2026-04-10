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
    if (block.type !== block_type) continue;

    const page = await fetchPage(z, event.entity.id);
    const blockIdNoDashes = block.id.replace(/-/g, '');

    matchingBlocks.push({
      ...block,
      block_url: `${page.url}#${blockIdNoDashes}`,
      parent_page_id: page.id,
      parent_page_url: page.url,
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
    (block) => block.type === block_type,
    (block, page) => {
      const blockIdNoDashes = block.id.replace(/-/g, '');
      return {
        ...block,
        block_url: `${page.url}#${blockIdNoDashes}`,
        parent_page_id: page.id,
        parent_page_url: page.url,
      };
    },
  );
};

module.exports = {
  key: 'new_block_webhook',
  noun: 'Block',
  display: {
    label: 'New Block (Instant)',
    description:
      'Triggers instantly when a new block of a specific type appears in a data source.',
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
        label: 'Block Type',
        type: 'string',
        default: 'meeting_notes',
        required: true,
        helpText:
          'The block type to watch for (e.g. "paragraph", "to_do", "callout", "image", "code", "meeting_notes").',
      },
    ],
    sample: {
      object: 'block',
      id: 'abc12345-1234-5678-abcd-1234567890ab',
      parent: {
        type: 'page_id',
        page_id: 'abc12345-1234-5678-abcd-1234567890ab',
      },
      created_time: '2026-03-10T10:06:00.000Z',
      last_edited_time: '2026-03-10T10:07:00.000Z',
      created_by: { object: 'user', id: 'abc12345' },
      last_edited_by: { object: 'user', id: 'abc12345' },
      has_children: false,
      in_trash: false,
      type: 'meeting_notes',
      block_url: 'https://www.notion.so/abc123456789#def456789012',
      parent_page_id: 'abc12345-1234-5678-abcd-1234567890ab',
      parent_page_url: 'https://www.notion.so/abc123456789',
    },
    outputFields: [
      { key: 'id', label: 'Block ID', type: 'string' },
      { key: 'type', label: 'Block Type', type: 'string' },
      { key: 'block_url', label: 'Block URL', type: 'string' },
      { key: 'parent_page_id', label: 'Parent Page ID', type: 'string' },
      { key: 'parent_page_url', label: 'Parent Page URL', type: 'string' },
      { key: 'created_time', label: 'Created Time', type: 'datetime' },
      { key: 'last_edited_time', label: 'Last Edited Time', type: 'datetime' },
      { key: 'has_children', label: 'Has Children', type: 'boolean' },
      { key: 'in_trash', label: 'In Trash', type: 'boolean' },
    ],
  },
};
