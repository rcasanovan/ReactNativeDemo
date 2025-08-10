import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ProductSelectionView } from '../views/ProductSelectionView';
import { PaymentView } from '../views/PaymentView';

export type RootStackParamList = {
  ProductSelection: { updatedCart?: any[]; selectedSaleType?: 'Retail' | 'Crew' | 'Happy hour' | 'Business Invitation' | 'Tourist Invitation'; resetCurrency?: boolean } | undefined;
  Payment: {
    cart: any[];
    total: number;
    currency: string;
    saleType: 'Retail' | 'Crew' | 'Happy hour' | 'Business Invitation' | 'Tourist Invitation';
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
          component={ProductSelectionView}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 