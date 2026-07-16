export interface Product {
  id: string;
  name: string;
  categoryName: string;
  categoryId: string;
  price: number;
  image: string;
  secondaryImages: string[];
  description: string;
  tagline: string;
  isNew?: boolean;
  materialOptions?: string[]; // hex codes or names
  sizeOptions?: string[];
  details?: string[];
  craftsmanship?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g., prod_id + size + material)
  product: Product;
  quantity: number;
  selectedMaterial: string; // hex or name
  selectedSize: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  provider: "google" | "facebook" | "apple" | "email";
  tier: "Bronze" | "Silver" | "Gold" | "Silver Collector" | "Gold Enthusiast" | "Platinum Connoisseur" | "Private VIP Member";
  loyaltyPoints: number;
  joinedDate: string;
  redeemedRewards?: string[];
}

