/**
 * Refrescos App
 * React Native application for drink sales and payments
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppProvider } from './src/contexts/AppContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AppProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </AppProvider>
  );
}

export default App;
