export type UserRole = "customer" | "merchant" | "admin" | "technician";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  shop: string;
  category: string;
  offer?: string;
  image: string;
  stock: number;
  rating: number;
}

export interface Shop {
  id: number;
  name: string;
  distance: string;
  rating: number;
  verified: boolean;
  logo: string;
  owner: string;
  email: string;
  revenue: number;
  totalOrders: number;
  status: "pending" | "approved" | "suspended";
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: "pending" | "packed" | "shipped" | "delivered";
  date: string;
}

export interface Ticket {
  id: string;
  device: string;
  issue: string;
  status: "open" | "in-progress" | "resolved";
  customer: string;
  date: string;
  priority: "low" | "medium" | "high";
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Sony WH-1000XM5", price: 299, originalPrice: 349, shop: "AudioHub", category: "Audio", offer: "15% OFF", image: "🎧", stock: 24, rating: 4.8 },
  { id: 2, name: "MacBook Air M3", price: 1099, originalPrice: 1199, shop: "TechZone", category: "Laptops", offer: "Free AppleCare", image: "💻", stock: 8, rating: 4.9 },
  { id: 3, name: "iPhone 15 Pro", price: 999, shop: "iStore", category: "Phones", offer: "Trade-in Deal", image: "📱", stock: 15, rating: 4.7 },
  { id: 4, name: "Samsung Galaxy S24", price: 849, originalPrice: 899, shop: "ElectroWorld", category: "Phones", offer: "5% OFF", image: "📱", stock: 20, rating: 4.6 },
  { id: 5, name: "AirPods Pro 2", price: 229, shop: "AudioHub", category: "Audio", image: "🎵", stock: 42, rating: 4.7 },
  { id: 6, name: "iPad Pro M4", price: 1099, shop: "TechZone", category: "Tablets", offer: "Bundle Deal", image: "📲", stock: 6, rating: 4.9 },
  { id: 7, name: "PS5 Slim", price: 449, shop: "GameStop", category: "Gaming", offer: "Free Game", image: "🎮", stock: 10, rating: 4.5 },
  { id: 8, name: "Dell XPS 15", price: 1299, originalPrice: 1499, shop: "CompuZone", category: "Laptops", offer: "13% OFF", image: "💻", stock: 5, rating: 4.6 },
];

export const MOCK_SHOPS: Shop[] = [
  { id: 1, name: "TechZone", distance: "0.3 mi", rating: 4.8, verified: true, logo: "⚡", owner: "Alex Kim", email: "alex@techzone.com", revenue: 45200, totalOrders: 312, status: "approved" },
  { id: 2, name: "AudioHub", distance: "0.8 mi", rating: 4.6, verified: true, logo: "🔊", owner: "Sarah Chen", email: "sarah@audiohub.com", revenue: 28900, totalOrders: 187, status: "approved" },
  { id: 3, name: "iStore", distance: "1.2 mi", rating: 4.9, verified: true, logo: "🍎", owner: "Mike Johnson", email: "mike@istore.com", revenue: 89400, totalOrders: 543, status: "approved" },
  { id: 4, name: "ElectroWorld", distance: "1.5 mi", rating: 4.4, verified: false, logo: "🌍", owner: "Lisa Park", email: "lisa@electroworld.com", revenue: 0, totalOrders: 0, status: "pending" },
  { id: 5, name: "Titan Electronics", distance: "2.1 mi", rating: 0, verified: false, logo: "🔧", owner: "James Wright", email: "james@titan.com", revenue: 0, totalOrders: 0, status: "pending" },
  { id: 6, name: "Volt Store", distance: "0.5 mi", rating: 4.7, verified: true, logo: "⚡", owner: "Emma Davis", email: "emma@volt.com", revenue: 34100, totalOrders: 221, status: "approved" },
];

export const MOCK_ORDERS: Order[] = [
  { id: "ORD-1001", customer: "John Doe", product: "Sony WH-1000XM5", quantity: 1, total: 299, status: "pending", date: "2024-03-12" },
  { id: "ORD-1002", customer: "Jane Smith", product: "AirPods Pro 2", quantity: 2, total: 458, status: "packed", date: "2024-03-11" },
  { id: "ORD-1003", customer: "Tom Wilson", product: "iPhone 15 Pro", quantity: 1, total: 999, status: "shipped", date: "2024-03-10" },
  { id: "ORD-1004", customer: "Emily Brown", product: "MacBook Air M3", quantity: 1, total: 1099, status: "pending", date: "2024-03-12" },
  { id: "ORD-1005", customer: "Chris Lee", product: "PS5 Slim", quantity: 1, total: 449, status: "delivered", date: "2024-03-08" },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: "TCK-201", device: "iPhone 15 Pro", issue: "Cracked Screen", status: "open", customer: "Alex D.", date: "2024-03-12", priority: "high" },
  { id: "TCK-202", device: "PS5 Controller", issue: "Analog Drift", status: "open", customer: "Sarah K.", date: "2024-03-11", priority: "medium" },
  { id: "TCK-203", device: "MacBook Pro 14\"", issue: "Battery Drain", status: "in-progress", customer: "Tom R.", date: "2024-03-10", priority: "medium" },
  { id: "TCK-204", device: "Samsung Galaxy S24", issue: "Charging Port", status: "open", customer: "Lisa M.", date: "2024-03-12", priority: "high" },
  { id: "TCK-205", device: "AirPods Pro 2", issue: "Left Bud No Sound", status: "resolved", customer: "Mike J.", date: "2024-03-09", priority: "low" },
  { id: "TCK-206", device: "Dell XPS 15", issue: "Overheating", status: "open", customer: "Emma W.", date: "2024-03-12", priority: "high" },
];
