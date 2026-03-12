const { pollBlocks } = require('../lib/poll-blocks');

const perform = async (z, bundle) => {
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
  key: 'new_block',
  noun: 'Block',
  display: {
    label: 'New Block',
    description:
      'Triggers when a new block of a specific type appears in a data source.',
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
          'The block type to watch for (e.g. "paragraph", "to_do", "callout", "image", "code").',
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
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'Hello world', link: null },
            plain_text: 'Hello world',
          },
        ],
        color: 'default',
      },
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
