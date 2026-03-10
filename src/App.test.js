import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

describe('MBB Mobile App', () => {
  test('App renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  test('App component is defined', () => {
    expect(App).toBeDefined();
  });
});
