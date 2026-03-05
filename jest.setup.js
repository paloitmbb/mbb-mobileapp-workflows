/* eslint-env jest */
// Jest setup file for React Native
jest.mock('react-native', () => {
  return {
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios) },
    StyleSheet: { create: (styles) => styles },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    SafeAreaView: 'SafeAreaView',
    StatusBar: 'StatusBar',
    Switch: 'Switch',
    AppRegistry: { registerComponent: jest.fn() },
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }) => children,
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));
