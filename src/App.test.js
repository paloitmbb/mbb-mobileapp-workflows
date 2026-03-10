const app = require('./index');

describe('MBB Mobile App', () => {
  test('app module exports correctly', () => {
    expect(app).toBeDefined();
  });

  test('app has route handlers', () => {
    const routes = app._router.stack
      .filter(r => r.route)
      .map(r => r.route.path);
    expect(routes).toContain('/');
    expect(routes).toContain('/health');
  });
});
