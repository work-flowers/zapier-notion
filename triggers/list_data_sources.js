const perform = async (z, bundle) => {
  const dataSources = [];
  let startCursor;

  do {
    const response = await z.request({
      url: 'https://api.notion.com/v1/search',
      method: 'POST',
      body: {
        filter: { property: 'object', value: 'data_source' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
        ...(startCursor ? { start_cursor: startCursor } : {}),
      },
    });

    const data = response.data;
    for (const ds of data.results) {
      const title =
        ds.title?.map((t) => t.plain_text).join('') || 'Untitled';
      dataSources.push({ id: ds.id, title });
    }
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);

  return dataSources;
};

module.exports = {
  key: 'list_data_sources',
  noun: 'Data Source',
  display: {
    label: 'List Data Sources',
    description: 'Lists data sources for use in dynamic dropdowns.',
    hidden: true,
  },
  operation: {
    perform,
    sample: { id: 'abc123', title: 'My Database' },
    outputFields: [
      { key: 'id', label: 'Data Source ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
    ],
  },
};
