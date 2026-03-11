const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('triggers.new_user', () => {
  it('should load users', async () => {
    const bundle = {
      authData: { api_key: process.env.API_KEY },
      inputData: {},
    };

    const results = await appTester(
      App.triggers['new_user'].operation.perform,
      bundle,
    );
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('name');
  });
});
