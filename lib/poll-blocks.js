const MAX_PAGES_TO_SCAN = 10;
const CHILD_BLOCKS_PAGE_SIZE = 100;

const fetchChildBlocks = async (z, pageId) => {
  const response = await z.request({
    url: `https://api.notion.com/v1/blocks/${pageId}/children`,
    params: { page_size: CHILD_BLOCKS_PAGE_SIZE },
  });
  return response.data.results;
};

/**
 * Polls a data source for blocks matching a filter function.
 *
 * Scans the N most recently edited pages, fetching only the first
 * page of child blocks per page (no deep pagination) and fanning the
 * per-page requests out in parallel so we stay well under Zapier's
 * 30s Lambda timeout.
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
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
      page_size: MAX_PAGES_TO_SCAN,
    },
  });

  const pages = queryResponse.data.results;

  const perPageResults = await Promise.all(
    pages.map(async (page) => {
      const blocks = await fetchChildBlocks(z, page.id);
      return blocks.filter(filterFn).map((block) => mapFn(block, page));
    }),
  );

  const matchingBlocks = perPageResults.flat();

  matchingBlocks.sort(
    (a, b) => new Date(b.created_time) - new Date(a.created_time),
  );

  return matchingBlocks;
};

module.exports = { pollBlocks, fetchChildBlocks };
