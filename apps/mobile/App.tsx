import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
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
import LoyaltyScreen from '@/screens/LoyaltyScreen';
import GiftCardsScreen from '@/screens/GiftCardsScreen';
import ReferralsScreen from '@/screens/ReferralsScreen';
import RequestReturnScreen from '@/screens/RequestReturnScreen';
import OrderFeedbackScreen from '@/screens/OrderFeedbackScreen';
import ProductReviewsScreen from '@/screens/ProductReviewsScreen';
import type { RootStackParamList, ShopStackParamList, OrdersStackParamList, AccountStackParamList } from '@/navigation/types';

const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
const Tab = createBottomTabNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#0f0f17' },
  headerTintColor: '#e6edf3',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#0f0f17' },
};

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={HEADER_OPTIONS}>
      <ShopStack.Screen name="Home" component={HomeScreen} options={{ title: 'NextCommerce', headerShown: false }} />
      <ShopStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'All Products' }} />
      <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <ShopStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <ShopStack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ title: 'Reviews' }} />
    </ShopStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={HEADER_OPTIONS}>
      <OrdersStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Package' }} />
      <OrdersStack.Screen name="OrderFeedback" component={OrderFeedbackScreen} options={{ title: 'Leave a Review' }} />
    </OrdersStack.Navigator>
  );
}

function AccountNavigator() {
  return (
    <AccountStack.Navigator screenOptions={HEADER_OPTIONS}>
      <AccountStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
      <AccountStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <AccountStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <AccountStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <AccountStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <AccountStack.Screen name="Loyalty" component={LoyaltyScreen} options={{ title: 'My Rewards' }} />
      <AccountStack.Screen name="GiftCards" component={GiftCardsScreen} options={{ title: 'Gift Cards' }} />
      <AccountStack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'Refer & Earn' }} />
      <AccountStack.Screen name="RequestReturn" component={RequestReturnScreen} options={{ title: 'Request Return' }} />
    </AccountStack.Navigator>
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
            component={ShopNavigator}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
          />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
              ...HEADER_OPTIONS,
              headerShown: true,
              title: 'Cart',
            }}
          />
          <Tab.Screen
            name="Orders"
            component={OrdersNavigator}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} /> }}
          />
          <Tab.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="♡" focused={focused} />,
              ...HEADER_OPTIONS,
              headerShown: true,
              title: 'Wishlist',
            }}
          />
          <Tab.Screen
            name="Account"
            component={AccountNavigator}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
