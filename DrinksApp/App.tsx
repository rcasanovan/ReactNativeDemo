/**
 * Refrescos App
 * React Native application for drink sales and payments
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </>
  );
}

export default App;
