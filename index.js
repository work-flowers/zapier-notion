const { addNotionHeaders } = require('./middleware');
const authentication = require('./authentication');
const newUserTrigger = require('./triggers/new_user');
const listDataSourcesTrigger = require('./triggers/list_data_sources');
const newBlockTrigger = require('./triggers/new_block');
const newUnsupportedBlockTrigger = require('./triggers/new_unsupported_block');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  beforeRequest: [addNotionHeaders],
  triggers: {
    [newUserTrigger.key]: newUserTrigger,
    [listDataSourcesTrigger.key]: listDataSourcesTrigger,
    [newBlockTrigger.key]: newBlockTrigger,
    [newUnsupportedBlockTrigger.key]: newUnsupportedBlockTrigger,
  },
};
