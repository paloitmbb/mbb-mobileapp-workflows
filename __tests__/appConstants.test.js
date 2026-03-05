import { APP_NAME, APP_VERSION, ENVIRONMENTS, API_URLS } from '../src/constants/appConstants';

describe('App Constants', () => {
  it('should have correct app name', () => {
    expect(APP_NAME).toBe('MBB Regional App');
  });

  it('should have a version', () => {
    expect(APP_VERSION).toBeDefined();
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should have all environments defined', () => {
    expect(ENVIRONMENTS.SIT).toBe('SIT');
    expect(ENVIRONMENTS.STAGING).toBe('Staging');
    expect(ENVIRONMENTS.PRODUCTION).toBe('Production');
  });

  it('should have API URLs for all environments', () => {
    expect(API_URLS.SIT).toContain('sit');
    expect(API_URLS.STAGING).toContain('staging');
    expect(API_URLS.PRODUCTION).toBeDefined();
  });
});
