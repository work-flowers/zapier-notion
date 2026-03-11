const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.notion.com/v1/users',
  });
  return response.data.results;
};

module.exports = {
  key: 'new_user',
  noun: 'User',
  display: {
    label: 'New User',
    description: 'Triggers when a new user is created.',
  },
  operation: {
    perform,
    canPaginate: true,
    sample: {
      id: 'abc123',
      object: 'user',
      name: 'Example User',
      type: 'person',
    },
    outputFields: [
      { key: 'id', label: 'User ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Type', type: 'string' },
    ],
  },
};
