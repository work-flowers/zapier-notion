module.exports = {
  type: 'custom',
  test: {
    url: 'https://api.notion.com/v1/users/me',
  },
  connectionLabel: '{{name}}',
  fields: [
    {
      key: 'api_key',
      required: true,
      label: 'API Key',
      type: 'password',
      helpText:
        'Create an internal integration at https://www.notion.so/profile/integrations and copy the token.',
    },
  ],
  customConfig: {},
};
