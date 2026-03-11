const { addNotionHeaders } = require('./middleware');
const authentication = require('./authentication');
const newUserTrigger = require('./triggers/new_user');
const listDataSourcesTrigger = require('./triggers/list_data_sources');
const newUnsupportedBlockTrigger = require('./triggers/new_unsupported_block');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  beforeRequest: [addNotionHeaders],
  triggers: {
    [newUserTrigger.key]: newUserTrigger,
    [listDataSourcesTrigger.key]: listDataSourcesTrigger,
    [newUnsupportedBlockTrigger.key]: newUnsupportedBlockTrigger,
  },
};
