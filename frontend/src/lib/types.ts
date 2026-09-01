export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: number;
  price: number;
  discountPrice: number | null;
  stockQty: number;
  brand: string;
  images: string[];
  badgeTags: string[];
  specs: [string, string][];
  goals: string[];
  ratingAvg: number;
  ratingCount: number;
  sold: number;
  createdAt?: string | Date | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  tagline: string | null;
  image: string | null;
  sortOrder: number;
};

export type Address = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

export type OrderItem = {
  id: number;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  priceAtPurchase: number;
};

export type OrderWithItems = {
  id: string;
  userId: string;
  totalAmount: number;
  shippingFee: number;
  status: string;
  paymentMethod: string;
  address: Address;
  createdAt: string | Date | null;
  items: OrderItem[];
};

export type Review = {
  id: number;
  productId: string;
  userId: string | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string | Date | null;
};

export type CatalogQuery = {
  categorySlug?: string;
  q?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  ids?: string[];
  limit?: number;
};
