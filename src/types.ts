export interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  category?: string;
  shopName?: string;
  shop?: string;
  merchantId?: string;
  offer?: string;
  image?: string;
  stock?: number;
}

export interface Address {
  _id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface OrderItem {
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  createdAt: string;
  status: string;
  totalAmount?: number;
  total?: number;
  products: OrderItem[];
  customerName?: string;
  shippingAddress?: string;
  productId?: Product;
  trackingId?: string;
}

export interface Merchant {
  _id: string;
  name: string;
}

export interface Txn {
  _id: string;
  isCredit: boolean;
  partnerName: string;
  date: string;
  amount: number;
  type: string;
}

export interface ChatContact {
  contactId: string;
  contactName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}
