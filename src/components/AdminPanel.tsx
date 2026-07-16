import React from "react";
import {
  Trash2,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  PlusCircle,
  FileImage,
  Info,
  Layers,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Tag,
  AlignLeft,
  X,
  RefreshCw,
  Search,
  ShieldCheck,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import { CATEGORIES } from "../data";

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onResetDatabase: () => void;
  onClose?: () => void;
}

// Preset luxury images for easy selection by the user
const PRESET_IMAGES = [
  {
    name: "Golden Classic Ring",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAddIhaoIoctIr0SZvOxl2amgoVXs5GW4AyMZuYqzRetb-PH8shfjL6df3_PiwyH1Hq439E0Lx2BbcFBHSvkTXKFeVAyN92YRXuBaqw5zNRh1EeGjfO57TlVuURTAiBXcnB5JXznCQbwsDIBHNH4A67hRHjmOnUwZMTbvAfO3y2yBNdTetjXHWJtoZ6VB_1S7MgOifVHC4W8P2FoG_bM4ak1sMXvZPk3gc-CSGh5MJoRqjQIgpDVA9Ml4wexbNyxsv5WZItb_S1I58",
  },
  {
    name: "Classic Leather Bangle",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX1p-uK0uxGwe-xPf4LECbNQnDpQJcqW5Jr2YX6Ra0MHk6ZdV47DDhFwL2t4uk-F03vVzVfNk88v-IYE043x2tQvF3X8Jj6qW9lkgQvcnmHfJpK5ybrDHJL6NZmzRIGQefgGFfHvSfLAXegiA3a5_s2x0bRJhjphz6rD0CEiJ7v01SWmhWJYNfQVRZCaL7fg7vqhNGHpiUImW4-5hst9s_FR3V1427zyirlzzqITw6CrhY-VSbVCahDYIUC6HF26HivG4KPS-2JWI",
  },
  {
    name: "Artisanal Timepiece",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2qzZ9-Ci55ZiMwGB8fudI_RR0HAUdvF20VU9LvhnWB024nsQ1AiUAuX5WPjX-QrxTLAXU9OHrxl-kyueIXrDx08qM_QgUhpXpgrFszL91bL1NaOaWoujJ0wlGu3E11Uvh2Zs6JGdMSasFktuL0bw2xagiuh8cTUdU9FgQ4a5Q4zezxTbNBtsJUqL-Xv3z9sszCiy18RBVOwkl2IoQ7XDbX4OMpHBNHfmlAizhiMESPgV1-jC25UnNXyIFVXZV19id6y1u95ZZlGo",
  },
  {
    name: "Hammered Gold Plaque",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsi9aeHhpg3RMBi01qh4k0jUy0jgoWSIttLzScTn8AvhKokeNaS1rWYj0ZdWgXiJYjomuT_PotZNM1fjCLkI_6wrpLziLe0B8OjjTE-KjfP4jtq13i35rUAqk762UXJCWnaHa26yvrpvtee77qbqz16wxmXSJvIk-lkEe9A2roHZxwd6PZkBGH6wYYgfv5b0RSV5FNmxblesK8DFdiSH6gPFZyJ3R4918rMtNpbrQ_bCod0_jTJPCpYN4HTDG-eYfSGEBLzXYo-aY",
  },
  {
    name: "Luxury Calfskin Cardholder",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA55XK6inPikYx_KnduhFvjR4J4r-Fz_0_MZeirVYlQnJcPeo3B3yJbFLZxM2oUqj2K4hOYY0VewYoDXWp5MzATq0mNes3bavvaIuwaKC-v7bFmUPeG5D1UbHy40cYoAniwy7x5OMf602l7xaIr3pzsyO28iOD8e4hdSxVOIQPeN0U8dossai-1QVPhtz7XRb9b0NxL8vjc5GglkDdH37aQtDOcZHbyQ7h9Ad-kMAtUcJAOHqIhAi6YLgg8Dcgt8eQGSeia3zX9Wl0",
  },
];

export default function AdminPanel({
  products,
  setProducts,
  onResetDatabase,
  onClose,
}: AdminPanelProps) {
   const [activeSubTab, setActiveSubTab] = React.useState<"catalog" | "add" | "analytics">("catalog");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Security Lock State
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem("vero_admin_authenticated") === "true";
  });
  const [passwordAttempt, setPasswordAttempt] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  
  // Ref to hold the callback prevents any React function state update quirks or closure issues
  const pendingCallbackRef = React.useRef<(() => void) | null>(null);
  const [showLockModal, setShowLockModal] = React.useState(false);

  const verifyAction = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      pendingCallbackRef.current = callback;
      setShowLockModal(true);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("vero_admin_authenticated");
    triggerNotification("Logged out from Curator mode.", "success");
  };

  // Form Fields
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("fine-jewelry");
  const [price, setPrice] = React.useState<number | "">("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isNew, setIsNew] = React.useState(false);
  const [materialOptions, setMaterialOptions] = React.useState<string>("#E5D5BC, #E5E4E2");
  const [sizeOptions, setSizeOptions] = React.useState<string>("06, 07, 08, 09");
  const [details, setDetails] = React.useState<string>("18k Solid Recycled Gold, Hand-finished matte satin luster");
  const [craftsmanship, setCraftsmanship] = React.useState("");

  // Feedback notifications
  const [notification, setNotification] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategoryId(editingProduct.categoryId);
      setPrice(editingProduct.price);
      setImageUrl(editingProduct.image);
      setTagline(editingProduct.tagline);
      setDescription(editingProduct.description);
      setIsNew(!!editingProduct.isNew);
      setMaterialOptions(editingProduct.materialOptions?.join(", ") || "");
      setSizeOptions(editingProduct.sizeOptions?.join(", ") || "");
      setDetails(editingProduct.details?.join(", ") || "");
      setCraftsmanship(editingProduct.craftsmanship || "");
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setName("");
    setCategoryId("fine-jewelry");
    setPrice("");
    setImageUrl("");
    setTagline("");
    setDescription("");
    setIsNew(false);
    setMaterialOptions("#E5D5BC, #E5E4E2");
    setSizeOptions("06, 07, 08, 09");
    setDetails("18k Solid Recycled Gold, Hand-finished matte-satin luster");
    setCraftsmanship("");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      triggerNotification("Product name is required.", "error");
      return;
    }
    if (!price || Number(price) <= 0) {
      triggerNotification("Please enter a valid price.", "error");
      return;
    }
    if (!imageUrl.trim()) {
      triggerNotification("Please enter or select an image URL.", "error");
      return;
    }

    const selectedCategoryObj = CATEGORIES.find((cat) => cat.id === categoryId);
    const categoryName = selectedCategoryObj ? selectedCategoryObj.name : "Fine Jewelry";

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `custom-${Date.now()}`,
      name: name.trim(),
      categoryId,
      categoryName,
      price: Number(price),
      image: imageUrl.trim(),
      secondaryImages: [imageUrl.trim()],
      tagline: tagline.trim() || `"${name.trim()} by VERO Boutique"`,
      description: description.trim() || "An authentic quiet luxury piece hand-finished with exceptional Italian craftsmanship.",
      isNew,
      materialOptions: materialOptions.split(",").map((s) => s.trim()).filter(Boolean),
      sizeOptions: sizeOptions.split(",").map((s) => s.trim()).filter(Boolean),
      details: details.split(",").map((s) => s.trim()).filter(Boolean),
      craftsmanship: craftsmanship.trim() || undefined,
    };

    const proceed = () => {
      if (editingProduct) {
        // Edit mode
        setProducts((prev) =>
          prev.map((prod) => (prod.id === editingProduct.id ? productData : prod))
        );
        triggerNotification(`"${name}" updated successfully.`);
        setEditingProduct(null);
      } else {
        // Create mode
        setProducts((prev) => [productData, ...prev]);
        triggerNotification(`"${name}" created successfully.`);
      }

      resetForm();
      setActiveSubTab("catalog");
    };

    verifyAction(proceed);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to remove "${productName}"?`)) {
      verifyAction(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        triggerNotification(`"${productName}" has been removed from the boutique.`);
      });
    }
  };

  const handleToggleNewArrival = (productId: string) => {
    verifyAction(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isNew: !p.isNew } : p))
      );
      triggerNotification("Updated product badge.");
    });
  };

  const filteredCatalog = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.price.toString().includes(q)
    );
  });

  // Simple diagnostics stats
  const totalItems = products.length;
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / (totalItems || 1));
  const newArrivalsCount = products.filter((p) => p.isNew).length;

  return (
    <div className="bg-white border border-brand-outline-variant/30 rounded-sm overflow-hidden shadow-sm select-text font-sans">
      {/* Admin Panel Header */}
      <div className="bg-brand-umber text-brand-linen p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-gold/20 text-brand-gold text-[10px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 rounded border border-brand-gold/30">
              Admin Control Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-light tracking-wide">
            Boutique Catalog Manager
          </h2>
          <p className="text-xs text-brand-linen/60 font-light">
            Live local database overrides. Add, remove, or modify VERO's catalog instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-sm text-xs font-mono">
              <Unlock className="w-3.5 h-3.5" />
              <span>المشرف نشط / Curator Mode Active</span>
              <button
                onClick={handleLogoutAdmin}
                className="hover:text-white underline text-[10px] ml-1.5 font-sans animate-pulse"
                title="Lock Curator Mode"
              >
                (قفل / Lock)
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                verifyAction(() => {
                  triggerNotification("Curator mode authorized.", "success");
                });
              }}
              className="flex items-center gap-1.5 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>فتح وضع المشرف / Unlock Admin</span>
            </button>
          )}

          <button
            onClick={() => {
              if (confirm("Reset website to its default curated boutique state? Any manual changes will be reverted.")) {
                verifyAction(() => {
                  onResetDatabase();
                  triggerNotification("Website reset to curated original design.", "success");
                });
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-gold hover:text-white border border-brand-gold/30 hover:border-white/50 px-4 py-2.5 rounded-sm transition-all bg-brand-gold/5"
            title="Reset Catalog to Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Curator Reset</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-brand-linen/10 hover:bg-brand-linen/20 rounded text-brand-linen transition-colors"
              aria-label="Close Admin Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Internal Tabs Navigation */}
      <div className="border-b border-brand-outline-variant/20 bg-brand-linen/20 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-3">
        <div className="flex items-center gap-1 border border-brand-outline-variant/20 rounded p-0.5 bg-white w-fit">
          <button
            onClick={() => {
              setActiveSubTab("catalog");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] ${
              activeSubTab === "catalog" && !editingProduct
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            Product Catalog ({totalItems})
          </button>
          <button
            onClick={() => {
              setActiveSubTab("add");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1 ${
              activeSubTab === "add" || editingProduct
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingProduct ? "Edit Product" : "Add Product"}</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("analytics");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] ${
              activeSubTab === "analytics"
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            System Status
          </button>
        </div>

        {activeSubTab === "catalog" && !editingProduct && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-outline/60" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-brand-outline-variant/40 text-xs px-10 py-2 rounded-sm outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 w-full sm:w-60 text-brand-umber"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-outline hover:text-brand-umber text-[10px]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Panel Content Body */}
      <div className="p-6 md:p-8">
        {/* Dynamic feedback notification block */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded border text-xs font-medium flex items-center gap-2.5 shadow-sm ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {activeSubTab === "catalog" && !editingProduct && (
          <div className="space-y-6 animate-fadeIn">
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-brand-outline-variant/30 rounded bg-brand-linen/10 space-y-3">
                <ShoppingBag className="w-10 h-10 text-brand-outline/40 mx-auto" />
                <h3 className="font-serif text-lg text-brand-umber font-light">No items found</h3>
                <p className="text-xs text-brand-outline/80 font-light max-w-sm mx-auto">
                  Try clearing your search keyword or add a beautiful brand-new luxury accessory to get started.
                </p>
                <button
                  onClick={() => setActiveSubTab("add")}
                  className="bg-brand-gold text-white text-xs font-semibold py-2.5 px-6 uppercase tracking-wider rounded-sm hover:bg-brand-umber transition-colors"
                >
                  Create New Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-brand-outline-variant/20 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-linen/40 text-brand-outline uppercase tracking-wider text-[10px] border-b border-brand-outline-variant/20">
                      <th className="py-4 px-6 font-semibold">Product Detail</th>
                      <th className="py-4 px-4 font-semibold">Category</th>
                      <th className="py-4 px-4 font-semibold">Price</th>
                      <th className="py-4 px-4 font-semibold text-center">Arrival Status</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-outline-variant/10">
                    {filteredCatalog.map((product) => (
                      <tr key={product.id} className="hover:bg-brand-linen/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded border border-brand-outline-variant/20 overflow-hidden bg-brand-linen/20 shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-brand-umber text-sm block">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-brand-outline font-mono block">
                                ID: {product.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-brand-outline font-medium">
                          {product.categoryName}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-brand-umber text-sm">
                          ${product.price.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleNewArrival(product.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all border ${
                              product.isNew
                                ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-sm"
                                : "bg-brand-linen/35 text-brand-outline/60 border-brand-outline-variant/20 hover:border-brand-outline-variant/50"
                            }`}
                            title="Toggle New Arrival tag"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{product.isNew ? "New Arrival" : "Standard"}</span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-brand-outline hover:text-brand-umber hover:bg-brand-linen/30 rounded transition-colors border border-transparent hover:border-brand-outline-variant/20"
                              title="Edit product specs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-all border border-transparent hover:border-rose-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(activeSubTab === "add" || editingProduct) && (
          <form onSubmit={handleSaveProduct} className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-brand-linen/15 border border-brand-outline-variant/10 p-5 rounded-sm space-y-1 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
                  Quick Suggestion
                </span>
                <p className="text-xs text-brand-outline font-light leading-relaxed">
                  Avoid searching external sites for photo links. You can click on any of the VERO premium preset high-fidelity lifestyle photo URLs below to populate the image form field immediately!
                </p>
              </div>
            </div>

            {/* Premium Images preset selection drawer */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-brand-outline uppercase tracking-widest block">
                VERO High-End Asset presets (Click to select)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      triggerNotification(`Loaded preset: "${preset.name}"`);
                    }}
                    className={`p-2 rounded border text-left text-[10px] font-medium transition-all flex flex-col gap-1.5 ${
                      imageUrl === preset.url
                        ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold/30"
                        : "border-brand-outline-variant/20 bg-white hover:border-brand-gold/50"
                    }`}
                  >
                    <div className="aspect-square rounded overflow-hidden bg-brand-linen/10">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-brand-umber truncate block w-full">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-brand-outline-variant/10 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Product Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Florentine Aurelia Earrings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium"
                />
              </div>

              {/* Product Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Price (USD) *</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium font-mono"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Boutique Collection *</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium"
                >
                  {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Image URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Image URL *</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="Paste direct HTTPS photo URL or select preset above"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Sensory Tagline (Aesthetic quotation)</span>
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Hammered golden loops framing your collar with delicate, sustainable grace."'
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-light italic"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Brand Description</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the materials, design philosophy, and fine elements of this accessory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs p-4 outline-none focus:border-brand-gold text-brand-umber font-light leading-relaxed"
                />
              </div>

              {/* Material Custom selection tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Material Swatches (Comma separated colors/codes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #E5D5BC, #E5E4E2, #B76E79"
                  value={materialOptions}
                  onChange={(e) => setMaterialOptions(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-mono"
                />
                <span className="text-[10px] text-brand-outline font-light block">
                  Provide hex codes or text names representing luxury swatches.
                </span>
              </div>

              {/* Sizes available */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Size Options (Comma separated tags)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small, Medium, Large, One Size"
                  value={sizeOptions}
                  onChange={(e) => setSizeOptions(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-mono"
                />
                <span className="text-[10px] text-brand-outline font-light block">
                  Tags displayed on checkout selection drawers.
                </span>
              </div>

              {/* Detailed specs */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Fine Specifications list (Comma separated details)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18k solid gold plated, Freshwater pearls, Florentine casting"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber"
                />
              </div>

              {/* Craftsmanship */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Artisanal Craftsmanship note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hand-carved inside historic ateliers of Milan by fourth-generation casting master technicians."
                  value={craftsmanship}
                  onChange={(e) => setCraftsmanship(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs p-4 outline-none focus:border-brand-gold text-brand-umber font-light"
                />
              </div>

              {/* Is New Arrival checkbox */}
              <div className="md:col-span-2 py-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 text-brand-gold focus:ring-brand-gold border-brand-outline-variant rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                      Tag as New Arrival
                    </span>
                    <span className="text-[10px] text-brand-outline font-light block">
                      Enables a "Seasonal / New Arrival" badge and lists item in the landing page carousel.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="pt-6 border-t border-brand-outline-variant/20 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setActiveSubTab("catalog");
                }}
                className="text-xs font-semibold uppercase tracking-wider text-brand-outline hover:text-brand-umber py-2.5 px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-gold text-white text-xs font-semibold py-3.5 px-10 uppercase tracking-[0.2em] hover:bg-brand-umber transition-all shadow-md w-full sm:w-auto"
              >
                {editingProduct ? "Save Changes" : "Forge Product Access"}
              </button>
            </div>
          </form>
        )}

        {activeSubTab === "analytics" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Bento Grid Diagnostic Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  Total Managed Catalog
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  {totalItems} Accessories
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Active in current browsing local state.
                </span>
              </div>

              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  Average Luxury Price
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  ${avgPrice.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Calculated dynamically across active items.
                </span>
              </div>

              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  New Arrival Spotlights
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  {newArrivalsCount} spotmarked
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Aesthetic badges active on product listings.
                </span>
              </div>
            </div>

            {/* General Database specs block */}
            <div className="bg-brand-linen/15 border border-brand-outline-variant/20 rounded-sm p-6 md:p-8 text-left space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-lg text-brand-umber font-normal">
                  How persistence operates
                </h3>
              </div>
              <p className="text-xs text-brand-outline font-light leading-relaxed max-w-2xl">
                Any luxury accessories added or removed through this manager are automatically synchronized to your local container sandbox's client state storage. That means they will persist securely across browser refreshes so you can test complete end-to-end purchasing, detail checks, and filters!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm("Reset boutique back to curated defaults?")) {
                      verifyAction(() => {
                        onResetDatabase();
                        triggerNotification("Restored standard product lines.");
                      });
                    }
                  }}
                  className="bg-brand-umber text-white text-[11px] font-semibold tracking-wider uppercase py-3 px-6 rounded-sm hover:bg-brand-gold transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Original Curated Lines</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Verification Overlay Modal */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 bg-brand-umber/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fff8f3] border border-brand-outline-variant/35 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm space-y-6 text-brand-umber font-sans text-right"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 mb-2 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-center">
                  تفويض المشرف مطلوب
                </h3>
                <p className="text-xs text-brand-outline font-light leading-relaxed text-center">
                  تعديل الكتالوج محمي بكلمة سر. الرجاء إدخال الرمز لتأكيد الإجراء.
                  <br />
                  <span className="text-[10px] text-brand-gold font-mono block mt-1">
                    Enter password to authorize modification
                  </span>
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordAttempt === "vero2026") {
                    setIsAuthenticated(true);
                    localStorage.setItem("vero_admin_authenticated", "true");
                    setPasswordError("");
                    const callback = pendingCallbackRef.current;
                    pendingCallbackRef.current = null;
                    setShowLockModal(false);
                    setPasswordAttempt("");
                    if (callback) {
                      callback();
                    }
                  } else {
                    setPasswordError("كلمة السر غير صحيحة. حاول مرة أخرى.");
                  }
                }}
                className="space-y-4 text-center"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-outline block text-center">
                    كلمة المرور / Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordAttempt}
                    onChange={(e) => {
                      setPasswordAttempt(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-center font-mono py-3 outline-none focus:border-brand-gold text-brand-umber text-sm"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-[10px] font-semibold text-rose-500 text-center animate-pulse">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      pendingCallbackRef.current = null;
                      setShowLockModal(false);
                      setPasswordAttempt("");
                      setPasswordError("");
                    }}
                    className="flex-1 border border-brand-outline-variant/30 text-brand-outline hover:text-brand-umber text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-colors bg-white text-center"
                  >
                    إلغاء / Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-gold hover:bg-brand-umber text-white text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-all shadow-sm text-center"
                  >
                    تأكيد / Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
