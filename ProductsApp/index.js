/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Ignore specific LogBox errors that are internal to React Native
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.',
  'Warning: Failed prop type',
]);

AppRegistry.registerComponent(appName, () => App);
