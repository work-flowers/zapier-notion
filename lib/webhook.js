const NOTION_WEBHOOKS_URL = 'https://api.notion.com/v1/webhooks';

/**
 * Subscribes to Notion webhook events.
 *
 * @param {object} z - Zapier z object
 * @param {string} targetUrl - Zapier-generated webhook URL
 * @param {string[]} eventTypes - Notion event types to subscribe to
 * @returns {object} Subscription data (must include `id` for unsubscribe)
 */
const subscribe = async (z, targetUrl, eventTypes) => {
  const response = await z.request({
    url: NOTION_WEBHOOKS_URL,
    method: 'POST',
    body: {
      url: targetUrl,
      event_types: eventTypes,
    },
  });

  return response.data;
};

/**
 * Unsubscribes from a Notion webhook.
 *
 * @param {object} z - Zapier z object
 * @param {string} webhookId - The webhook subscription ID from subscribe
 */
const unsubscribe = async (z, webhookId) => {
  await z.request({
    url: `${NOTION_WEBHOOKS_URL}/${webhookId}`,
    method: 'DELETE',
  });
};

/**
 * Fetches a single block by ID and returns its full object.
 *
 * @param {object} z - Zapier z object
 * @param {string} blockId - The block ID to retrieve
 * @returns {object} The block object
 */
const fetchBlock = async (z, blockId) => {
  const response = await z.request({
    url: `https://api.notion.com/v1/blocks/${blockId}`,
  });
  return response.data;
};

/**
 * Fetches the parent page for a given page ID.
 *
 * @param {object} z - Zapier z object
 * @param {string} pageId - The page ID to retrieve
 * @returns {object} The page object
 */
const fetchPage = async (z, pageId) => {
  const response = await z.request({
    url: `https://api.notion.com/v1/pages/${pageId}`,
  });
  return response.data;
};

module.exports = { subscribe, unsubscribe, fetchBlock, fetchPage };
