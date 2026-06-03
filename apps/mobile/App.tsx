import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { ProductListScreen } from '@/screens/ProductListScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { OrderHistoryScreen } from '@/screens/OrderHistoryScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { CartScreen } from '@/screens/CartScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { WishlistScreen } from '@/screens/WishlistScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import OrderTrackingScreen from '@/screens/OrderTrackingScreen';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#0f0f17' },
  headerTintColor: '#e6edf3',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#0f0f17' },
};

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'NextCommerce' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Package' }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

const TAB_OPTIONS = {
  tabBarStyle: {
    backgroundColor: '#0f0f17',
    borderTopColor: '#2d2d44',
    height: 60,
    paddingBottom: 8,
  },
  tabBarActiveTintColor: '#e94560',
  tabBarInactiveTintColor: '#6b7280',
  headerShown: false,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator screenOptions={TAB_OPTIONS}>
          <Tab.Screen
            name="Shop"
            component={ShopStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👟" focused={focused} /> }}
          />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
              ...HEADER_OPTIONS,
              title: 'Cart',
            }}
          />
          <Tab.Screen
            name="Orders"
            component={OrdersStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} /> }}
          />
          <Tab.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="♡" focused={focused} />,
              ...HEADER_OPTIONS,
              title: 'Wishlist',
            }}
          />
          <Tab.Screen
            name="Account"
            component={AccountStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
