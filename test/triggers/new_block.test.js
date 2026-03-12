const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('triggers.new_block', () => {
  it('should find paragraph blocks with full API response', async () => {
    const bundle = {
      authData: { api_key: process.env.API_KEY },
      inputData: {
        data_source_id: '1e491b07-11ac-80ce-8b86-000b29ba4f68',
        block_type: 'paragraph',
      },
    };

    const results = await appTester(
      App.triggers['new_block'].operation.perform,
      bundle,
    );
    expect(results.length).toBeGreaterThan(0);

    const block = results[0];
    // Full API response fields
    expect(block.object).toBe('block');
    expect(block.type).toBe('paragraph');
    expect(block).toHaveProperty('id');
    expect(block).toHaveProperty('parent');
    expect(block).toHaveProperty('created_time');
    expect(block).toHaveProperty('last_edited_time');
    expect(block).toHaveProperty('created_by');
    expect(block).toHaveProperty('last_edited_by');
    expect(block).toHaveProperty('has_children');
    expect(block).toHaveProperty('in_trash');
    expect(block).toHaveProperty('paragraph');
    // Enriched fields
    expect(block).toHaveProperty('block_url');
    expect(block).toHaveProperty('parent_page_id');
    expect(block).toHaveProperty('parent_page_url');
  });
});
