const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('triggers.list_data_sources', () => {
  it('should return data sources', async () => {
    const bundle = {
      authData: { api_key: process.env.API_KEY },
      inputData: {},
    };

    const results = await appTester(
      App.triggers['list_data_sources'].operation.perform,
      bundle,
    );
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('title');
  });
});
