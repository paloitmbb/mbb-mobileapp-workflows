import { getConfig } from '../src/config/appConfig';

describe('App Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return SIT config by default', () => {
    const config = getConfig();
    expect(config.environment).toBe('SIT');
    expect(config.debugMode).toBe(true);
  });

  it('should return correct log level for SIT', () => {
    const config = getConfig();
    expect(config.logLevel).toBe('debug');
  });
});
