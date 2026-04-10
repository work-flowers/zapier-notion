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

/**
 * Polls a data source for blocks matching a filter function.
 *
 * @param {object} z - Zapier z object
 * @param {string} dataSourceId - Notion data source ID
 * @param {function} filterFn - (block) => boolean
 * @param {function} mapFn - (block, page) => output object
 * @returns {Array} Matching blocks, newest first
 */
const pollBlocks = async (z, dataSourceId, filterFn, mapFn) => {
  const queryResponse = await z.request({
    url: `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
    method: 'POST',
    body: {
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: MAX_PAGES_TO_SCAN,
    },
  });

  const pages = queryResponse.data.results;
  const matchingBlocks = [];

  for (const page of pages) {
    const blocks = await fetchChildBlocks(z, page.id);

    for (const block of blocks) {
      if (filterFn(block)) {
        matchingBlocks.push(mapFn(block, page));
      }
    }
  }

  matchingBlocks.sort(
    (a, b) => new Date(b.created_time) - new Date(a.created_time),
  );

  return matchingBlocks;
};

module.exports = { pollBlocks, fetchChildBlocks };
