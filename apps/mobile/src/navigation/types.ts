export type RootStackParamList = {
  Home: undefined;
  ProductList: undefined;
  ProductDetail: { slug: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Cart: undefined;
  Search: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Settings: undefined;
  Loyalty: undefined;
  GiftCards: undefined;
  Compare: undefined;
  Referrals: undefined;
  RequestReturn: { orderId: string };
  AddressBook: undefined;
};

export type ShopStackParamList = {
  Home: undefined;
  ProductList: undefined;
  ProductDetail: { slug: string };
  Search: undefined;
};

export type OrdersStackParamList = {
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  OrderFeedback: { orderId: string; productTitle?: string; variantId?: string };
};

export type AccountStackParamList = {
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  Notifications: undefined;
  Loyalty: undefined;
  GiftCards: undefined;
  Referrals: undefined;
  RequestReturn: { orderId: string };
};

export type WishlistStackParamList = {
  Wishlist: undefined;
  ProductDetail: { slug: string };
};
