export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { slug: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Cart: undefined;
  Search: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type ShopStackParamList = {
  ProductList: undefined;
  ProductDetail: { slug: string };
  Search: undefined;
};

export type OrdersStackParamList = {
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
};

export type AccountStackParamList = {
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type WishlistStackParamList = {
  Wishlist: undefined;
  ProductDetail: { slug: string };
};
