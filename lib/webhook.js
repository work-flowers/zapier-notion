/**
 * "Subscribes" to Notion webhook events.
 *
 * Notion does not support programmatic webhook creation — subscriptions must
 * be configured in the integration settings UI at notion.so. This function
 * stores the Zapier target URL so it can be surfaced to the user.
 *
 * @param {object} z - Zapier z object
 * @param {string} targetUrl - Zapier-generated webhook URL
 * @returns {object} Data stored in bundle.subscribeData for later use
 */
const subscribe = async (z, targetUrl) => {
  z.console.log(
    `Webhook target URL for Notion integration settings: ${targetUrl}`,
  );
  return { targetUrl };
};

/**
 * "Unsubscribes" from Notion webhook events.
 *
 * Since subscriptions are managed in the Notion UI, this is a no-op.
 */
const unsubscribe = async () => {};

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
