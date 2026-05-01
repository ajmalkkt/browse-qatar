# 🍽️ Restaurant Offers Home Page

Create an engaging landing page that showcases **restaurant deals and promotions** with intuitive filtering and search capabilities, allowing users to quickly discover relevant dining offers.

---

## 🎯 Key Sections & Features

### ⭐ Featured Offers Section
- Display **visually appealing offer cards** in a responsive grid layout.  
- Each card should include:  
  - Restaurant **logo**  
  - **Discount percentage** (e.g., 30% OFF)  
  - **Validity dates** (e.g., Valid till Sept 30)  

---

### 🎛️ Interactive Filters
- Provide easy-to-use filters for refining offers:
  - **Cuisine Type** (e.g., Indian, Italian, Continental)  
  - **Location** (city/area based)  
  - **Offer Categories** (Buffet, Combo, Happy Hour, etc.)  
- Filters should be implemented as **dropdowns or toggle buttons**.  

---

### 🔍 Search Functionality
- Prominent **search bar** at the top of the page.  
- Support **auto-suggestions** based on:
  - Restaurant names  
  - Offer keywords (e.g., “Pizza”, “Drinks”, “Buffet”)  

---

### 🃏 Card Components
- Design offer cards with **consistent styling**:
  - **Discount badges** (e.g., `30% OFF`)  
  - **Price comparison**: original price (strikethrough) vs. discounted price (highlighted).  
  - Clean, **professional aesthetic** with:
    - Rounded corners  
    - Subtle shadows  
    - Clear typography  

---

### ⏳ Loading States
- When fetching offer data:
  - Display **skeleton loaders** in place of cards.  
  - Ensure a **smooth, non-jarring** user experience.  

---

✅ Goal: A professional, modern, and user-friendly home page that makes exploring restaurant offers **fast, intuitive, and visually appealing**.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

---

## 🚀 Hosting & Scaling Guidance

### Resource Recommendations
- **Frontend (static React build):**
  - Can be served via CDN or static hosting (Netlify, Vercel, GCP/AWS/Azure static hosting).
  - Memory/CPU needs are minimal—static files are cached and served efficiently.
  - Typical: 256–512 MB RAM, 0.1–0.2 vCPU (or use CDN/static host).

- **Backend/API (if used for dynamic data):**
  - For 50,000 users/day (mostly browsing/listing):
    - 1–2 vCPU, 2–4 GB RAM is a good starting point. Use autoscaling if possible.
    - Scale up if you see high API load.

- **Database (PostgreSQL/MySQL):**
  - For 100 restaurants and ~10 offers each (all mostly static data):
    - Storage: <100 MB
    - Start with: 1–2 vCPU, 2–4 GB RAM (managed DB)
    - Scale up if you add more data or see slowdowns.
    - Use indexes on restaurant and offer IDs for fast lookups.
  - For 50k users/day: 2–4 vCPU, 4–8 GB RAM for smooth performance and concurrency.

### Summary
- Cloud providers let you start small and scale up as needed.
- Use monitoring to adjust resources based on real usage.
- For mostly static content, the main load is on the backend and DB if users are searching/filtering a lot.
- This setup will easily support your expected load and future growth.
