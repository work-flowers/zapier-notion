const { fetchChildBlocks } = require('../lib/poll-blocks');

const perform = async (z, bundle) => {
  const { page_id, block_type } = bundle.inputData;

  const pageResponse = await z.request({
    url: `https://api.notion.com/v1/pages/${page_id}`,
  });
  const page = pageResponse.data;

  const blocks = await fetchChildBlocks(z, page_id);
  const matching = [];

  for (const block of blocks) {
    if (block.type !== block_type) continue;

    const blockIdNoDashes = block.id.replace(/-/g, '');
    matching.push({
      ...block,
      block_url: `${page.url}#${blockIdNoDashes}`,
      parent_page_id: page.id,
      parent_page_url: page.url,
    });
  }

  return matching;
};

module.exports = {
  key: 'find_blocks_by_type',
  noun: 'Block',
  display: {
    label: 'Find Blocks by Type',
    description:
      'Finds child blocks of a specific type within a page.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'page_id',
        label: 'Page ID',
        type: 'string',
        required: true,
        helpText:
          'The ID of the Notion page to search for blocks in.',
      },
      {
        key: 'block_type',
        label: 'Block Type',
        type: 'string',
        default: 'meeting_notes',
        required: true,
        helpText:
          'The block type to filter for (e.g. "meeting_notes", "paragraph", "to_do", "callout").',
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
