import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import PRODUCTS directly
import { PRODUCTS } from "./src/data.ts";

// Dual ESM/CJS safe resolution of filename and directory
const currentFilename = typeof __filename !== "undefined" 
  ? __filename 
  : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== "undefined" 
  ? __dirname 
  : path.dirname(currentFilename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "products-db.json");

app.use(express.json());

// Initialize database file with defaults if not exists
function getProductsFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading products database:", err);
  }
  // Write default products to disk
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(PRODUCTS, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing default products database:", err);
  }
  return PRODUCTS;
}

function saveProductsToDisk(products: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving products to database:", err);
  }
}

// API Routes
app.get("/api/products", (req, res) => {
  const products = getProductsFromDisk();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const products = getProductsFromDisk();
  const newProduct = req.body;
  if (!newProduct.id) {
    newProduct.id = `custom-${Date.now()}`;
  }
  products.unshift(newProduct);
  saveProductsToDisk(products);
  res.json(products);
});

app.put("/api/products/:id", (req, res) => {
  const products = getProductsFromDisk();
  const productId = req.params.id;
  const updatedProduct = req.body;
  
  const index = products.findIndex((p: any) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    saveProductsToDisk(products);
    res.json(products);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const products = getProductsFromDisk();
  const productId = req.params.id;
  const filtered = products.filter((p: any) => p.id !== productId);
  saveProductsToDisk(filtered);
  res.json(filtered);
});

app.post("/api/products/reset", (req, res) => {
  saveProductsToDisk(PRODUCTS);
  res.json(PRODUCTS);
});

// Vite or Static Assets handling
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initServer();
