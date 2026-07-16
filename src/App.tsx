import React from "react";
import {
  Heart,
  ShoppingBag,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Minus,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  Gem,
  Check,
  Trash2,
  SlidersHorizontal,
  Info,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Product, CartItem, UserProfile } from "./types";
import { CATEGORIES, PRODUCTS, STORIES } from "./data";

// Subcomponents
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import ProductCard from "./components/ProductCard";
import QuickViewModal from "./components/QuickViewModal";
import BrandPillars from "./components/BrandPillars";
import CheckoutFlow from "./components/CheckoutFlow";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";

export default function App() {
  // Navigation & Page state
  const [activeTab, setActiveTab] = React.useState<string>("home"); // 'home', 'shop', 'product-detail', 'favorites', 'bag', 'our-story'

  // Private Member Auth states
  const [user, setUser] = React.useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("vero_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("vero_user", JSON.stringify(profile));
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    // Dynamically calculate tier based on points according to user request
    let finalTier: UserProfile["tier"] = "Bronze";
    const pts = updatedProfile.loyaltyPoints || 0;
    if (pts >= 15000) {
      finalTier = "Gold";
    } else if (pts >= 5000) {
      finalTier = "Silver";
    } else {
      finalTier = "Bronze";
    }

    const resolvedProfile: UserProfile = {
      ...updatedProfile,
      tier: finalTier
    };

    setUser(resolvedProfile);
    localStorage.setItem("vero_user", JSON.stringify(resolvedProfile));
    
    // Also update in website accounts if registered
    if (resolvedProfile.provider === "email") {
      const savedAccountsStr = localStorage.getItem("vero_website_accounts");
      if (savedAccountsStr) {
        try {
          const accounts = JSON.parse(savedAccountsStr);
          const emailKey = resolvedProfile.email.toLowerCase();
          if (accounts[emailKey]) {
            accounts[emailKey] = {
              ...accounts[emailKey],
              name: resolvedProfile.name,
              tier: resolvedProfile.tier,
              avatar: resolvedProfile.avatar,
              loyaltyPoints: resolvedProfile.loyaltyPoints,
              redeemedRewards: resolvedProfile.redeemedRewards
            };
            localStorage.setItem("vero_website_accounts", JSON.stringify(accounts));
          }
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("vero_user");
  };

  // Dynamic products list persistent in localStorage
  const [products, setProducts] = React.useState<Product[]>(() => {
    const saved = localStorage.getItem("vero_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    products.find((p) => p.id === "sculpted-aurelian-ring") || products[0]
  );

  // Cart & Favorites state loaded from localStorage if exists
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    const saved = localStorage.getItem("vero_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Default mock items for high-end boutique look on first load
    const prod1 = PRODUCTS.find((p) => p.id === "rose-gold-tbar");
    const prod2 = PRODUCTS.find((p) => p.id === "classic-heirloom-timepiece");
    const prod3 = PRODUCTS.find((p) => p.id === "artisanal-textured-ring");

    const defaultCart: CartItem[] = [];
    if (prod1) {
      defaultCart.push({
        id: "rose-gold-tbar_#B76E79_S",
        product: prod1,
        quantity: 1,
        selectedMaterial: "#B76E79",
        selectedSize: "S",
      });
    }
    if (prod2) {
      defaultCart.push({
        id: "classic-heirloom-timepiece_#E5D5BC_One Size",
        product: prod2,
        quantity: 1,
        selectedMaterial: "#E5D5BC",
        selectedSize: "One Size",
      });
    }
    if (prod3) {
      defaultCart.push({
        id: "artisanal-textured-ring_#E5E4E2_06",
        product: prod3,
        quantity: 1,
        selectedMaterial: "#E5E4E2",
        selectedSize: "06",
      });
    }
    return defaultCart;
  });

  const [favorites, setFavorites] = React.useState<string[]>(() => {
    const saved = localStorage.getItem("vero_favorites");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return ["sculpted-aurelian-ring", "baguette-solitaire", "trinity-stack"];
  });

  // Search slider & filter states
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("default"); // 'default', 'price-asc', 'price-desc', 'name-asc'
  
  // Modals & Panels
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  
  // Promo code & calculation states
  const [promoInput, setPromoInput] = React.useState("");
  const [activePromo, setActivePromo] = React.useState("");
  const [promoError, setPromoError] = React.useState("");
  const [promoSuccess, setPromoSuccess] = React.useState("");

  // Product detail active secondary photo swap state
  const [activeDetailImage, setActiveDetailImage] = React.useState<string>("");

  // Accordion draws on product detail page
  const [accordionOpen, setAccordionOpen] = React.useState({
    details: true,
    craftsmanship: false,
  });

  // Sync state with localStorage
  React.useEffect(() => {
    localStorage.setItem("vero_cart", JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem("vero_favorites", JSON.stringify(favorites));
  }, [favorites]);

  React.useEffect(() => {
    localStorage.setItem("vero_products", JSON.stringify(products));
  }, [products]);

  const handleResetDatabase = () => {
    localStorage.removeItem("vero_products");
    setProducts(PRODUCTS);
  };

  // Sync main image on product details whenever selected product changes
  React.useEffect(() => {
    if (selectedProduct) {
      setActiveDetailImage(selectedProduct.image);
    }
  }, [selectedProduct]);

  // Cart operations
  const handleAddToBag = (product: Product, material: string, size: string, quantity = 1) => {
    const cartItemId = `${product.id}_${material}_${size}`;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { id: cartItemId, product, quantity, selectedMaterial: material, selectedSize: size }];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty < 1 ? 1 : newQty };
          }
          return item;
        })
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Favorite operations
  const toggleFavorite = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const isFavorited = (productId: string) => favorites.includes(productId);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxRate = 0.08; // 8%
  
  // Promo code discounts
  const discountMultiplier = activePromo === "WELCOME10" ? 0.1 : activePromo === "VERO" ? 0.15 : 0;
  const discountAmount = cartSubtotal * discountMultiplier;
  const estimatedTax = (cartSubtotal - discountAmount) * taxRate;
  const cartTotal = cartSubtotal - discountAmount + estimatedTax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");
    const code = promoInput.trim().toUpperCase();
    if (code === "WELCOME10") {
      setActivePromo("WELCOME10");
      setPromoSuccess("WELCOME10 applied! Enjoy 10% discount.");
    } else if (code === "VERO") {
      setActivePromo("VERO");
      setPromoSuccess("VERO applied! Enjoy 15% VIP discount.");
    } else if (code === "") {
      setPromoError("Please enter a valid code.");
    } else {
      setPromoError("Promo code not recognized.");
    }
    setPromoInput("");
  };

  const handleProductDetailNavigate = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter and sort items list
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
      );
    }

    // Sort By
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy, products]);

  // Pagination index helper (let's display 8 items per page)
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-linen text-brand-umber selection:bg-brand-gold/20 select-none pb-16 md:pb-0">
      {/* Scroll indicator bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-brand-gold/10 z-[200]">
        <motion.div
          className="h-full bg-brand-gold"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5 }}
        />
      </div>

      {/* Header component */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        cartCount={cartCount}
        openSearch={() => setSearchOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />

      {/* Primary views body */}
      <main className="flex-grow pt-24 md:pt-28">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-24"
            >
              {/* Hero Section */}
              <section className="relative h-[78vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0 scale-105 select-none">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-[15s] ease-out hover:scale-110"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHKrz9Y-W_j5e70EQWVUrBfGCKOmcRbm4ljs9QfY8UDTbpWQ6Q8mlmCDAt8UokML1BhB2tvYkXb4opSBauA63Qa0lp6ZoZLcYgITTJxNUH3pyD3vDheBWqCijgu_GIju4oEuZTHRh1Rc46SFSSaNfyCHQ4sAjZAkiTANFNHi5yPigufRgv1vXyLX9_UeM-jH0EWcMeSzMo7BPVw7HZpiBcDaLAPQPsVY_ur16wIF0WKKQ-4oqRZRGiV7Ko7nq0gCdJvn9s7sC65nc')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-[#211b12]/15" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6">
                  <p className="font-sans text-xs md:text-sm font-medium tracking-[0.3em] text-brand-surface-low uppercase">
                    Quiet Luxury
                  </p>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-brand-surface-low leading-tight md:leading-none tracking-tight font-medium">
                    Details Define You
                  </h1>
                  <p className="text-brand-surface-low/80 max-w-md mx-auto text-xs md:text-sm tracking-[0.1em] font-light leading-relaxed uppercase pt-2">
                    Meticulously Crafted Fine Accessories For Discerning Hearts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-8">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory("all");
                        setActiveTab("shop");
                      }}
                      className="bg-brand-gold text-white px-10 py-4 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-brand-umber transition-all shadow-md w-full sm:w-auto"
                    >
                      EXPLORE COLLECTION
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab("our-story")}
                      className="border border-brand-surface-low text-brand-surface-low px-10 py-4 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-brand-surface-low hover:text-brand-umber transition-all w-full sm:w-auto"
                    >
                      OUR STORY
                    </motion.button>
                  </div>
                </div>
              </section>

              {/* Brand Pillars dynamic section */}
              <BrandPillars />

              {/* New Arrivals Horizontal scroll */}
              <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 border-b border-brand-outline-variant/10 pb-6">
                  <div>
                    <span className="text-brand-gold font-sans text-xs font-semibold tracking-[0.2em] uppercase block mb-2">
                      Seasonal
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-brand-umber">
                      New Arrivals
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setActiveTab("shop");
                    }}
                    className="group flex items-center gap-2 font-sans text-xs font-medium text-brand-gold tracking-[0.15em] uppercase hover:opacity-75 transition-opacity"
                  >
                    View All{" "}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {products.filter((p) => p.isNew)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onProductClick={handleProductDetailNavigate}
                        onQuickViewClick={(prod, e) => {
                          e.stopPropagation();
                          setQuickViewProduct(prod);
                        }}
                        isFavorited={isFavorited(product.id)}
                        toggleFavorite={toggleFavorite}
                      />
                    ))}
                </div>
              </section>

              {/* Curated Categories Grid with visual links */}
              <section className="py-16 bg-brand-surface-low">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                  <div className="text-center mb-16">
                    <span className="text-[10px] tracking-[0.2em] font-medium text-brand-gold uppercase block mb-3">
                      Linen &amp; Gold
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-brand-umber">
                      Curated Categories
                    </h2>
                    <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-6"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[650px]">
                    {/* Category: Fine Jewelry */}
                    <div
                      onClick={() => {
                        setSelectedCategory("fine-jewelry");
                        setActiveTab("shop");
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="md:col-span-8 group relative overflow-hidden h-[300px] md:h-full cursor-pointer shadow-sm border border-brand-outline-variant/10"
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7ddR-XGRFF7ZwjqRe3Lb-HvaihviUNpTFMTo10PZQ_-iWX3dHYb_j9NphUXFfq1RLIVS5ulRSzV-s712e4G7vtkJcHA0muDtY9DHEbI_zQeXANvKStKeeksritCSGP5ih6oc_mDzIpJo-JK5lgL9ZI9pc4qOe6-fZnEle31gNmW3Ra9tpqcoVs_RDpioKwvUn4j-9P5j6w_lfSUUHJjGBkUWuw94qrQAEzt1RoGMnNYlGOJnyMZ7U2W6oqjGuTXTYxge8Try-zWs"
                        alt="Fine Jewelry"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#211b12]/10 group-hover:bg-[#211b12]/30 transition-colors duration-700" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-serif text-3xl md:text-4xl tracking-[0.1em] mb-4 font-light">
                          Fine Jewelry
                        </h3>
                        <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase">
                          Shop The Collection
                        </span>
                      </div>
                    </div>

                    {/* Category: Timepieces */}
                    <div
                      onClick={() => {
                        setSelectedCategory("timepieces");
                        setActiveTab("shop");
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="md:col-span-4 group relative overflow-hidden h-[300px] md:h-full cursor-pointer shadow-sm border border-brand-outline-variant/10"
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHURVDMw0Ut_yNnemHeLgqN9kEmRJy9KfyIJhWGm36fQh-CMtrO0pGYuaCr4MR-OaDy0sUnfzCwvRWYY9815RVkpasZq00PZ0fRbmOmCVpkPwSWKRtiicrCUREgDhVRGMuHYa792wqM27VJFjYjxLBhHEpkVf0Ipvb3HquyCydhbrE5uPWIC5KS6E4w4d31wBTOnNQIu3ooZafSZ0qWewaHaQeiPuHaoRpnPOY5j01Hhjk48HWuTgKuMfPyIs5QbInR7O3tUJq5c8"
                        alt="Timepieces"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#211b12]/10 group-hover:bg-[#211b12]/30 transition-colors duration-700" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-serif text-3xl tracking-[0.1em] mb-4 font-light">
                          Timepieces
                        </h3>
                        <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase">
                          Discover
                        </span>
                      </div>
                    </div>

                    {/* Category: Leather Goods */}
                    <div
                      onClick={() => {
                        setSelectedCategory("leather-goods");
                        setActiveTab("shop");
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="md:col-span-4 group relative overflow-hidden h-[300px] md:h-[350px] cursor-pointer shadow-sm border border-brand-outline-variant/10"
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoQPdv1Jz-RjB7b1hjgtGz63JLAFwfHrviFOr5ny4f6MFDkZxOQHHTjelEbjGpcI5RvtXjohZvo8yjwqrKVDJG_6wpfjn26-AFirT4svWQONukVwV2KLBxWem4yr7Ey28wxvNJXeFlKCpGqoT_PXUZ3yHVpvS7-0ASt7bKmz8N3dAwt6XznGpD02rnAxlpnzC8jT9H_DIEHfTWzCnCRQA2GHwO-xljT6UvWXNkBEMwG2F3fuvp53Fw3u3cXqeNnjEM3uiSoHn5P7k"
                        alt="Leather Goods"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#211b12]/10 group-hover:bg-[#211b12]/30 transition-colors duration-700" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-serif text-3xl tracking-[0.1em] mb-4 font-light">
                          Leather Goods
                        </h3>
                        <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase">
                          View All
                        </span>
                      </div>
                    </div>

                    {/* Category: Necklaces/Essentials */}
                    <div
                      onClick={() => {
                        setSelectedCategory("all");
                        setSearchQuery("Aurelian");
                        setActiveTab("shop");
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="md:col-span-8 group relative overflow-hidden h-[300px] md:h-[350px] cursor-pointer shadow-sm border border-brand-outline-variant/10"
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_4xPadl5w6Pl2wmap9TNWjuW3eRqmSaee8UcVUYb5Ob0tjxyVXXgSUz8bd800TgShznRuwLsCSE8fL8g54lW8D6Y2Wqn77Y3VnnDy11ZQQyS78UrFyUgxqRXe83BtXdaR7o05YC071Tjfyge5uII8vI9eb_n0zITggflZzz8_ocIceRDAsQovQqPZTN6SXT9FkEnH750_FvFUxz-___-L_RW-wCIyddPds8SWGNUvJZlb-z3tgbVqUqsnmttQOxLDZXqdfrdHuOs"
                        alt="The Essentials"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#211b12]/10 group-hover:bg-[#211b12]/30 transition-colors duration-700" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-serif text-3xl md:text-4xl tracking-[0.1em] mb-4 font-light">
                          The Essentials
                        </h3>
                        <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white px-8 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase">
                          Shop Now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Journal Quote & Philosophy Section */}
              <section className="py-24 max-w-3xl mx-auto px-6 text-center border-t border-brand-outline-variant/10">
                <span className="text-brand-gold font-sans text-xs font-semibold tracking-[0.3em] uppercase block mb-6">
                  The Vero Journal
                </span>
                <h2 className="font-serif italic text-3xl md:text-4xl text-brand-umber leading-relaxed font-light">
                  "Join our world of understated luxury and receive curated updates on new releases."
                </h2>
                <div className="w-10 h-px bg-brand-gold/40 mx-auto mt-10"></div>
              </section>
            </motion.div>
          )}

          {activeTab === "shop" && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-8"
            >
              {/* Header Info */}
              <section className="mb-12 md:mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brand-outline-variant/20 pb-8">
                  <div className="space-y-3">
                    <span className="text-brand-gold font-sans text-[10px] font-semibold tracking-[0.2em] uppercase block">
                      Curated Boutique
                    </span>
                    <h1 className="font-serif text-4xl text-brand-umber tracking-wide uppercase font-normal">
                      Shop All
                    </h1>
                    <p className="font-sans text-xs font-light text-brand-outline max-w-lg leading-relaxed">
                      Meticulously crafted accessories designed for those who appreciate the poetry of detail. Discover quiet luxury below.
                    </p>
                  </div>

                  {/* Filter action bar */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 font-sans text-xs">
                    {/* Category select dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-brand-outline uppercase tracking-wider text-[10px] font-semibold">
                        Category:
                      </span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-transparent border-b border-brand-outline-variant text-xs text-brand-umber outline-none py-1.5 focus:border-brand-gold font-medium tracking-wider"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="h-4 w-px bg-brand-outline-variant/30 hidden md:block" />

                    {/* Sort Select */}
                    <div className="flex items-center gap-2">
                      <span className="text-brand-outline uppercase tracking-wider text-[10px] font-semibold">
                        Sort By:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-transparent border-b border-brand-outline-variant text-xs text-brand-umber outline-none py-1.5 focus:border-brand-gold font-medium tracking-wider"
                      >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Alphabetical</option>
                      </select>
                    </div>

                    {/* Clear filter button if any is active */}
                    {(selectedCategory !== "all" || searchQuery !== "" || sortBy !== "default") && (
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSearchQuery("");
                          setSortBy("default");
                          setCurrentPage(1);
                        }}
                        className="text-brand-gold underline underline-offset-4 font-semibold tracking-wider text-[10px] uppercase"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Grid listing */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={handleProductDetailNavigate}
                      onQuickViewClick={(prod, e) => {
                        e.stopPropagation();
                        setQuickViewProduct(prod);
                      }}
                      isFavorited={isFavorited(product.id)}
                      toggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-brand-surface-low border border-brand-outline-variant/10">
                  <p className="font-serif text-lg text-brand-outline italic mb-4">
                    No accessories matching your filters were found.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setSortBy("default");
                    }}
                    className="bg-brand-gold text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-brand-umber transition-all"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-24 flex items-center justify-center gap-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    className="w-11 h-11 flex items-center justify-center rounded-full border border-brand-outline-variant/40 text-brand-gold hover:bg-brand-gold hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-gold transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-2 text-xs font-semibold tracking-widest">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-brand-gold text-white font-bold"
                              : "text-brand-outline hover:text-brand-gold hover:bg-brand-surface-low"
                          }`}
                        >
                          {pageNum < 10 ? `0${pageNum}` : pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    className="w-11 h-11 flex items-center justify-center rounded-full border border-brand-outline-variant/40 text-brand-gold hover:bg-brand-gold hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-gold transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "product-detail" && selectedProduct && (
            <motion.div
              key="product-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-8"
            >
              {/* Breadcrumbs */}
              <nav className="mb-10 text-[10px] font-sans tracking-[0.15em] uppercase text-brand-outline/60">
                <ul className="flex flex-wrap items-center gap-2">
                  <li>
                    <button onClick={() => setActiveTab("home")} className="hover:text-brand-gold transition-colors">
                      Home
                    </button>
                  </li>
                  <li>/</li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedCategory(selectedProduct.categoryId);
                        setActiveTab("shop");
                      }}
                      className="hover:text-brand-gold transition-colors"
                    >
                      {selectedProduct.categoryName}
                    </button>
                  </li>
                  <li>/</li>
                  <li className="text-brand-gold font-semibold truncate max-w-[200px]">
                    {selectedProduct.name}
                  </li>
                </ul>
              </nav>

              {/* Main Detail Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Product Gallery (Left) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Hero Image view */}
                  <div className="relative aspect-[4/5] bg-brand-surface-low overflow-hidden group">
                    <img
                      src={activeDetailImage}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Toggle Favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(selectedProduct, e)}
                      className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${
                        isFavorited(selectedProduct.id)
                          ? "bg-brand-gold text-white border-brand-gold"
                          : "bg-white/70 text-brand-gold border-transparent hover:bg-white hover:border-brand-gold/20"
                      }`}
                      aria-label="Favorite"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited(selectedProduct.id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Thumbnails */}
                  {selectedProduct.secondaryImages && selectedProduct.secondaryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {selectedProduct.secondaryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDetailImage(img)}
                          className={`aspect-square overflow-hidden border transition-all duration-300 rounded-sm relative ${
                            activeDetailImage === img
                              ? "border-brand-gold ring-2 ring-brand-gold/10 scale-[0.98]"
                              : "border-brand-outline-variant/30 hover:border-brand-gold/40"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Detail view ${i + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Information panel (Right) */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-sans tracking-[0.25em] font-medium text-brand-gold uppercase block mb-3">
                        HANDCRAFTED SERIES
                      </span>
                      <h1 className="font-serif text-3xl md:text-4xl text-brand-umber tracking-wide leading-tight mb-2 font-normal">
                        {selectedProduct.name}
                      </h1>
                      <p className="font-sans text-xl font-semibold text-brand-gold">
                        ${selectedProduct.price.toLocaleString()}.00
                      </p>
                    </div>

                    <div className="h-px bg-brand-outline-variant/20 w-full" />

                    {/* Taglines and long desc */}
                    <div className="space-y-4">
                      <p className="font-serif italic text-sm text-brand-outline leading-relaxed">
                        {selectedProduct.tagline}
                      </p>
                      <p className="text-xs text-brand-outline font-light leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* Choices (Material selection) */}
                    {selectedProduct.materialOptions && selectedProduct.materialOptions.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-semibold text-brand-umber uppercase tracking-[0.15em] block">
                          Material
                        </span>
                        <div className="flex gap-4">
                          {selectedProduct.materialOptions.map((hex, i) => {
                            // Map materials
                            const isSelected = selectedProduct.materialOptions?.[i] === hex;
                            return (
                              <button
                                key={i}
                                className="w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center shadow-sm"
                                style={{
                                  backgroundColor: hex,
                                  borderColor: isSelected ? "var(--color-brand-gold)" : "transparent",
                                  boxShadow: isSelected ? "0 0 0 4px rgba(106, 92, 71, 0.15)" : "none",
                                }}
                                title={hex}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes Selection */}
                    {selectedProduct.sizeOptions && selectedProduct.sizeOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-brand-umber uppercase tracking-[0.15em] block">
                            Select Size
                          </span>
                          <button 
                            onClick={() => alert("Size Guide:\nRing measurements based on standard US sizing (06, 07, 08, 09).\nBangle measurements (S, M, L) based on wrist circumferences: S (6.0 in), M (6.5 in), L (7.0 in).")}
                            className="text-[10px] text-brand-gold underline underline-offset-4 font-semibold tracking-wider uppercase"
                          >
                            Size Guide
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {selectedProduct.sizeOptions.map((size) => (
                            <button
                              key={size}
                              className="px-5 py-3.5 border border-brand-gold bg-brand-gold text-white text-xs tracking-wider uppercase font-medium rounded-sm"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-6 pt-10">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const material = selectedProduct.materialOptions?.[0] || "#E5D5BC";
                        const size = selectedProduct.sizeOptions?.[0] || "One Size";
                        handleAddToBag(selectedProduct, material, size);
                        setActiveTab("bag");
                      }}
                      className="w-full bg-brand-gold hover:bg-brand-umber text-white font-sans text-xs font-semibold py-5 uppercase tracking-[0.2em] transition-all shadow-md rounded-sm flex items-center justify-center gap-3"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                      Add to Bag
                    </motion.button>
                    <p className="text-center text-[10px] font-light text-brand-outline tracking-wider uppercase flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-gold" />
                      Complimentary bespoke shipping &amp; authentic wrapping
                    </p>

                    {/* Specifications Accordion draws */}
                    <div className="mt-8 border-t border-brand-outline-variant/30 pt-4">
                      {/* Accordion 1: Details */}
                      <div className="border-b border-brand-outline-variant/20 py-4">
                        <button
                          onClick={() =>
                            setAccordionOpen((prev) => ({ ...prev, details: !prev.details }))
                          }
                          className="w-full flex justify-between items-center text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-umber outline-none"
                        >
                          Product Details
                          <ChevronRight
                            className={`w-4 h-4 text-brand-gold transition-transform duration-300 ${
                              accordionOpen.details ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {accordionOpen.details && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden text-[11px] font-light text-brand-outline leading-relaxed pt-3 space-y-1.5"
                            >
                              {selectedProduct.details?.map((detail, index) => (
                                <p key={index}>• {detail}</p>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Accordion 2: Craftsmanship */}
                      <div className="border-b border-brand-outline-variant/20 py-4">
                        <button
                          onClick={() =>
                            setAccordionOpen((prev) => ({
                              ...prev,
                              craftsmanship: !prev.craftsmanship,
                            }))
                          }
                          className="w-full flex justify-between items-center text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-umber outline-none"
                        >
                          The Craftsmanship
                          <ChevronRight
                            className={`w-4 h-4 text-brand-gold transition-transform duration-300 ${
                              accordionOpen.craftsmanship ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {accordionOpen.craftsmanship && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden text-[11px] font-light text-brand-outline leading-relaxed pt-3"
                            >
                              <p>
                                {selectedProduct.craftsmanship ||
                                  "Each VERO creation is hand-forged by master jewellers utilizing ancient Roman lost-wax casting techniques combined with cutting-edge micro-precision tooling. We dedicate a minimum of 40 focused workshop hours to forge, hand-polish, and authenticate every custom article."}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Essence of VERO values block */}
              <section className="mt-32 py-16 bg-brand-surface-low border-y border-brand-outline-variant/10 text-center">
                <div className="max-w-2xl mx-auto space-y-6 px-6">
                  <span className="text-[10px] tracking-[0.25em] font-medium text-brand-gold uppercase block">
                    The Essence of Vero
                  </span>
                  <h3 className="font-serif text-3xl text-brand-umber font-light">
                    Restraint Over Ostentation
                  </h3>
                  <p className="font-sans text-xs font-light text-brand-outline leading-relaxed">
                    Luxury is not loud; it is the quiet confidence in every meticulously finished edge and thoughtfully selected recycled precious material.
                  </p>
                </div>
              </section>

              {/* Complete the Set / Suggested Carousel */}
              <section className="mt-32">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
                  <div>
                    <span className="text-brand-gold font-sans text-xs font-semibold tracking-[0.2em] uppercase block mb-2">
                      Complete the set
                    </span>
                    <h2 className="font-serif text-3xl text-brand-umber">
                      You May Also Love
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {PRODUCTS.filter((p) => p.id !== selectedProduct.id)
                    .slice(0, 4)
                    .map((rec) => (
                      <ProductCard
                        key={rec.id}
                        product={rec}
                        onProductClick={handleProductDetailNavigate}
                        onQuickViewClick={(p, e) => {
                          e.stopPropagation();
                          setQuickViewProduct(p);
                        }}
                        isFavorited={isFavorited(rec.id)}
                        toggleFavorite={toggleFavorite}
                      />
                    ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-8"
            >
              <section className="mb-12 border-b border-brand-outline-variant/20 pb-8">
                <span className="text-brand-gold font-sans text-[10px] font-semibold tracking-[0.2em] uppercase block mb-3">
                  Your Custom Vault
                </span>
                <h1 className="font-serif text-4xl text-brand-umber tracking-wide uppercase font-normal">
                  Saved Favorites
                </h1>
                <p className="font-sans text-xs font-light text-brand-outline max-w-lg mt-2 leading-relaxed">
                  Your personally curated list of timeless jewelry, timepieces, and accessories. Add them to bag instantly.
                </p>
              </section>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                  {PRODUCTS.filter((p) => favorites.includes(p.id)).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={handleProductDetailNavigate}
                      onQuickViewClick={(prod, e) => {
                        e.stopPropagation();
                        setQuickViewProduct(prod);
                      }}
                      isFavorited={true}
                      toggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-brand-surface-low border border-brand-outline-variant/10">
                  <p className="font-serif text-lg text-brand-outline italic mb-6">
                    Your luxury vault is currently empty.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setActiveTab("shop");
                    }}
                    className="bg-brand-gold text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-brand-umber transition-all"
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "bag" && (
            <motion.div
              key="bag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-8"
            >
              <section className="mb-12">
                <h1 className="font-serif text-4xl text-brand-umber tracking-wide uppercase font-normal mb-2">
                  Shopping Bag
                </h1>
                <p className="font-sans text-xs font-medium uppercase tracking-widest text-brand-outline">
                  {cart.length === 0
                    ? "Your bag is empty"
                    : `${cartCount} Item${cartCount > 1 ? "s" : ""} Selected`}
                </p>
              </section>

              {cart.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Items List (Left) */}
                  <div className="lg:col-span-8 space-y-8">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-6 border-b border-brand-outline-variant/20 pb-8 group"
                      >
                        {/* Image */}
                        <div className="w-full sm:w-32 aspect-square bg-brand-surface-low overflow-hidden rounded-sm cursor-pointer shadow-sm">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            onClick={() => handleProductDetailNavigate(item.product)}
                            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3
                                onClick={() => handleProductDetailNavigate(item.product)}
                                className="font-serif text-lg text-brand-umber hover:text-brand-gold cursor-pointer transition-colors mb-1 font-normal"
                              >
                                {item.product.name}
                              </h3>
                              <p className="font-sans text-[10px] text-brand-outline uppercase tracking-wider">
                                {item.product.categoryName} •{" "}
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full border align-middle mr-1"
                                  style={{ backgroundColor: item.selectedMaterial }}
                                />
                                Size {item.selectedSize}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-brand-outline/60 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4.5 h-4.5 stroke-[1.5]" />
                            </button>
                          </div>

                          {/* Qty edit & price tag */}
                          <div className="flex justify-between items-end mt-6">
                            <div className="flex items-center border border-brand-outline-variant/40 rounded-sm bg-white">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="px-3 py-1.5 text-brand-outline hover:text-brand-gold hover:bg-brand-surface-low transition-colors active:scale-90"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-4 py-1 text-xs font-semibold text-brand-umber border-x border-brand-outline-variant/20">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="px-3 py-1.5 text-brand-outline hover:text-brand-gold hover:bg-brand-surface-low transition-colors active:scale-90"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-sans text-sm font-semibold text-brand-gold">
                              ${(item.product.price * item.quantity).toLocaleString()}.00
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 text-center sm:text-left">
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setActiveTab("shop");
                        }}
                        className="text-brand-gold font-sans text-xs font-semibold border-b border-brand-gold/30 pb-1 hover:border-brand-gold transition-all duration-300 uppercase tracking-widest"
                      >
                        CONTINUE SHOPPING
                      </button>
                    </div>
                  </div>

                  {/* Summary recap block (Right) */}
                  <aside className="lg:col-span-4">
                    <div className="bg-brand-surface-low p-6 md:p-8 rounded-sm shadow-sm border border-brand-outline-variant/20 sticky top-24 space-y-6">
                      <h2 className="font-serif text-lg text-brand-umber font-semibold uppercase tracking-wider mb-2">
                        Summary
                      </h2>

                      <div className="space-y-3 font-sans text-xs text-brand-outline font-light border-b border-brand-outline-variant/10 pb-5">
                        <div className="flex justify-between">
                          <span>SUBTOTAL</span>
                          <span className="font-semibold text-brand-umber">
                            ${cartSubtotal.toLocaleString()}.00
                          </span>
                        </div>
                        {activePromo && (
                          <div className="flex justify-between text-brand-gold font-semibold">
                            <span>PROMO ({activePromo})</span>
                            <span>-${discountAmount.toLocaleString()}.00</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>SHIPPING</span>
                          <span className="font-semibold text-brand-gold uppercase tracking-wider text-[10px]">
                            COMPLIMENTARY
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ESTIMATED TAX (8%)</span>
                          <span className="font-semibold text-brand-umber">
                            ${estimatedTax.toLocaleString()}.00
                          </span>
                        </div>
                      </div>

                      {/* Promocode entry */}
                      <form onSubmit={handleApplyPromo} className="space-y-2">
                        <label className="block text-[9px] font-bold text-brand-umber uppercase tracking-widest">
                          Gift Card / Promo Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Try VERO or WELCOME10"
                            className="flex-grow bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light uppercase px-1 focus:ring-0"
                          />
                          <button
                            type="submit"
                            className="text-brand-gold font-sans text-xs font-semibold hover:opacity-75 transition-opacity"
                          >
                            APPLY
                          </button>
                        </div>
                        {promoError && <p className="text-[10px] text-red-500 font-light">{promoError}</p>}
                        {promoSuccess && (
                          <p className="text-[10px] text-brand-gold font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {promoSuccess}
                          </p>
                        )}
                      </form>

                      {/* Total */}
                      <div className="pt-2">
                        <div className="flex justify-between items-end font-serif font-semibold text-brand-umber">
                          <span className="text-sm">Total</span>
                          <span className="text-2xl text-brand-gold">
                            ${cartTotal.toLocaleString()}.00
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCheckoutOpen(true)}
                        className="w-full bg-brand-gold hover:bg-brand-umber text-white font-sans text-xs font-semibold py-5 tracking-[0.15em] uppercase transition-all shadow-md rounded-sm flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 stroke-[1.5]" />
                        Proceed to Checkout
                      </motion.button>

                      <div className="flex items-center justify-center gap-2 text-brand-outline/40">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase tracking-widest">
                          Secure Encrypted Connection
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="text-center py-20 bg-brand-surface-low border border-brand-outline-variant/10">
                  <p className="font-serif text-lg text-brand-outline italic mb-6">
                    Your luxury shopping bag is currently empty.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setActiveTab("shop");
                    }}
                    className="bg-brand-gold text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-brand-umber transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "our-story" && (
            <motion.div
              key="our-story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-6 py-12 space-y-16"
            >
              <section className="text-center space-y-4">
                <span className="text-brand-gold font-sans text-xs font-semibold tracking-[0.3em] uppercase block">
                  ESTABLISHED 2024
                </span>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-umber font-light">
                  Our Story
                </h1>
                <p className="font-sans text-xs font-light text-brand-outline tracking-wider uppercase max-w-md mx-auto leading-relaxed">
                  Timeless accessories forged in Florence, celebrating local artisan heritage.
                </p>
                <div className="w-12 h-px bg-brand-gold/40 mx-auto mt-6"></div>
              </section>

              {/* Stories sections loop */}
              {STORIES.map((story, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
                      isEven ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`space-y-6 ${isEven ? "" : "md:order-last"}`}>
                      <h3 className="font-serif text-2xl text-brand-umber font-semibold tracking-wide">
                        {story.title}
                      </h3>
                      <p className="font-serif italic text-xs md:text-sm text-brand-outline leading-relaxed border-l-2 border-brand-gold/30 pl-4 py-1">
                        "{story.quote}"
                      </p>
                      <p className="font-sans text-xs font-light text-brand-outline leading-relaxed">
                        Every single collection is built inside small Italian workshops, utilizing natural processes and centuries-old Roman techniques. Hand-finished for premium luxury definition.
                      </p>
                    </div>
                    <div className="aspect-[4/3] bg-brand-surface-low overflow-hidden shadow-sm rounded-sm">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "admin" && user?.email === "vero2026@vero.com" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto px-6 py-6 md:py-12"
            >
              <AdminPanel
                products={products}
                setProducts={setProducts}
                onResetDatabase={handleResetDatabase}
                onClose={() => setActiveTab("home")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer component */}
      <Footer setActiveTab={setActiveTab} />

      {/* Mobile view Bottom Navbar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        cartCount={cartCount}
        user={user}
      />

      {/* Quick View Modal drawer */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToBag={handleAddToBag}
        isFavorited={quickViewProduct ? isFavorited(quickViewProduct.id) : false}
        toggleFavorite={toggleFavorite}
      />

      {/* Private Member Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Search slider Panel overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[160] flex justify-end">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-brand-umber/45 backdrop-blur-sm"
            />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-md h-full bg-brand-linen shadow-2xl border-l border-brand-outline-variant/30 flex flex-col z-10"
            >
              <div className="p-6 border-b border-brand-outline-variant/20 flex justify-between items-center bg-[#fff8f3]">
                <h3 className="font-serif text-lg text-brand-umber font-semibold uppercase tracking-wider">
                  Search Boutique
                </h3>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-brand-outline hover:text-brand-gold transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter keywords (e.g. Ring, Watch)"
                    className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-3 text-sm font-light tracking-wide focus:ring-0 pl-1"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-3 text-brand-outline/60 hover:text-brand-gold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Popular categories shortcut suggestions */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-brand-umber uppercase tracking-widest block mb-1">
                    Suggested Categories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(1).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSearchQuery("");
                          setSearchOpen(false);
                          setActiveTab("shop");
                        }}
                        className="px-3.5 py-2 bg-brand-surface-low border border-brand-outline-variant/20 hover:border-brand-gold rounded-full text-[10px] font-sans font-medium text-brand-outline hover:text-brand-gold uppercase tracking-wider transition-all"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time searched results */}
                {searchQuery.trim() && (
                  <div className="space-y-4 pt-4 border-t border-brand-outline-variant/10">
                    <span className="text-[10px] font-bold text-brand-umber uppercase tracking-widest block mb-2">
                      Results Found ({filteredProducts.length})
                    </span>
                    <div className="space-y-4">
                      {filteredProducts.slice(0, 5).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSearchOpen(false);
                            handleProductDetailNavigate(prod);
                          }}
                          className="flex items-center gap-4 cursor-pointer group"
                        >
                          <div className="w-12 h-15 bg-brand-surface-low overflow-hidden rounded-sm shadow-sm">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-serif font-medium text-brand-umber group-hover:text-brand-gold transition-colors">
                              {prod.name}
                            </h4>
                            <p className="text-[10px] text-brand-outline font-light uppercase tracking-wider">
                              {prod.categoryName} • ${prod.price.toLocaleString()}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-brand-outline/30 group-hover:text-brand-gold transition-colors" />
                        </div>
                      ))}
                      {filteredProducts.length > 5 && (
                        <button
                          onClick={() => {
                            setSearchOpen(false);
                            setActiveTab("shop");
                          }}
                          className="w-full text-center text-xs text-brand-gold font-semibold underline underline-offset-4 uppercase tracking-widest pt-2 block"
                        >
                          View all results
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout secure Slide-over Panel overlay */}
      <CheckoutFlow
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        subtotal={cartSubtotal}
        tax={estimatedTax}
        discount={discountAmount}
        total={cartTotal}
        promoCode={activePromo}
        onClearCart={handleClearCart}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}
