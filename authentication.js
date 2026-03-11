module.exports = {
  type: 'custom',
  test: {
    headers: {
      'Notion-Version': '2025-09-03',
      Authorization: 'Bearer {{bundle.authData.api_key}}',
    },
    url: 'https://api.notion.com/v1/users/me',
  },
  connectionLabel: '{{name}}',
  fields: [
    {
      computed: false,
      key: 'api_key',
      required: true,
      label: 'API Key',
      type: 'password',
      helpText: 'Create an internal integration at https://www.notion.so/profile/integrations and copy the token.',
    },
  ],
  customConfig: {},
};
