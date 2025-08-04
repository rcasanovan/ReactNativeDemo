import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ProductSelectionScreen } from '../screens/ProductSelectionScreen';
import { PaymentScreen } from '../screens/PaymentScreen';

export type RootStackParamList = {
  ProductSelection: { updatedCart?: any[] } | undefined;
  Payment: {
    cart: any[];
    total: number;
    currency: string;
    saleType: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ProductSelection"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="ProductSelection"
          component={ProductSelectionScreen}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 