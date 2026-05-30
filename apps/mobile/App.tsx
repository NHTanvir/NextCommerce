import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductListScreen } from '@/screens/ProductListScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: '#0d1117' },
  headerTintColor: '#e6edf3',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#0d1117' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'NextCommerce' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
