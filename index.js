const authentication = require('./authentication');
const newUserTrigger = require('./triggers/new_user.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  requestTemplate: { params: {}, headers: {} },
  triggers: { [newUserTrigger.key]: newUserTrigger },
};
