const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('triggers.new_unsupported_block', () => {
  it('should find mail blocks in the data source', async () => {
    const bundle = {
      authData: { api_key: process.env.API_KEY },
      inputData: {
        data_source_id: '1e491b07-11ac-80ce-8b86-000b29ba4f68',
        block_type: 'mail',
      },
    };

    const results = await appTester(
      App.triggers['new_unsupported_block'].operation.perform,
      bundle,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].block_type).toBe('mail');
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('parent_page_id');
    expect(results[0]).toHaveProperty('parent_page_url');
    expect(results[0]).toHaveProperty('created_time');
  });
});
