
const SHOW_DISCOUNTED_PRICE = import.meta.env.VITE_SHOW_DISCOUNTED_PRICE === "true";
const SHOW_CUISINE_NAV = import.meta.env.VITE_SHOW_CUISINE_NAV === "true";

const ENQUIRY_EMAIL = import.meta.env.VITE_ENQUIRY_EMAIL || "info@dinedeals.com";
const ENQUIRY_PHONE = import.meta.env.VITE_ENQUIRY_PHONE || "+974 1234 5678";

const SHOW_OFFER_TYPE_FILTER = import.meta.env.VITE_SHOW_OFFER_TYPE_FILTER === "true";
const SHOW_OFFER_DETAIL = import.meta.env.VITE_SHOW_OFFER_DETAIL === "true";
const SHOW_OFFER_AVATAR = import.meta.env.VITE_SHOW_OFFER_AVATAR === "true";
const LOG_API_RESPONSE = import.meta.env.VITE_LOG_API_RESPONSE === "true";
const ENABLE_RANDOM_SORT = import.meta.env.VITE_ENABLE_RANDOM_SORT === "true";
const SHOW_VERTICAL_NAV = import.meta.env.VITE_SHOW_VERTICAL_NAV === "true" || true; // Default to true if not set

// Restaurant sorting configuration
// Options: 'ID' (latest first), 'RATING' (highest first), 'LATEST' (updatedAt), 'NONE'
const RESTAURANT_SORT_CONFIG = import.meta.env.VITE_RESTAURANT_SORT_CONFIG || 'ID';

// Auth provider: KEYCLOAK or FIREBASE
const AUTH_PROVIDER = (import.meta.env.VITE_AUTH_PROVIDER || "KEYCLOAK").toUpperCase();

// Feature flags for signup (disabled by default, set VITE_ENABLE_SIGNUP=true to enable)
const ENABLE_SIGNUP = import.meta.env.VITE_ENABLE_SIGNUP === "true";

const DEFAULT_COUNTRY = import.meta.env.VITE_DEFAULT_COUNTRY || "Qatar";
const DEFAULT_CATEGORY = import.meta.env.VITE_DEFAULT_CATEGORY || "All Offers";

const SHOW_OFFERS = import.meta.env.VITE_SHOW_OFFERS === "true";
const SHOW_PRODUCTS = import.meta.env.VITE_SHOW_PRODUCTS === "true";
const SHOW_COUPONS = import.meta.env.VITE_SHOW_COUPONS === "true";
const SHOW_ENTERTAINMENT = import.meta.env.VITE_SHOW_ENTERTAINMENT === "true";
const SHOW_FINANCIAL_SERVICE = import.meta.env.VITE_SHOW_FINANCIAL_SERVICE === "true";


export const cuisineOptions = [
  "Super Saver",
  "Qatari Dine",
  "Arabic Dishes",
  "Mandi",
  "Fried Chicken",
  "Grill",
  "Shawaya",
  "Shawarma",
  "Pizza",
  "Burger",
  "Sandwich",
  "Bakes",
  "Juice",
  "Falooda",
  "Ice Cream",
  "Dessert",
  "Coffee",
  "Tea",
  "Healthy",
  "Philipino Cuisine",
  "Chinese",
  "Italian",
  "Thailand Cuisine",
  "Pakistani Food",
  "South Indian",
  "North Indian",
  "Sadya",
];

export const cuisineLists = [
  {
    name: "Qatari Dine",
    img: "/images/cuisines/QatariDine.png",
    description: "Authentic Qatari culinary tradition featuring local spices and traditional cooking methods.",
    altText: "Traditional Qatari Dining experience with Mandi and Majboos"
  },
  {
    name: "Arabic Dishes",
    img: "/images/cuisines/ArabicDishes.png",
    description: "Diverse Middle Eastern flavors including Mezze, Kebabs, and classic Levantine dishes.",
    altText: "Platter of assorted Arabic dishes and appetizers"
  },
  {
    name: "Mandi",
    img: "/images/cuisines/Mandi.png",
    description: "Traditional Hadhrami dish consisting mainly of meat and rice with a special blend of spices.",
    altText: "Delicious Mandi rice with tender slow-cooked meat"
  },
  {
    name: "Fried Chicken",
    img: "/images/cuisines/FriedChicken.png",
    description: "Crispy, golden-brown fried chicken served with various sides and dipping sauces.",
    altText: "Crispy golden fried chicken bucket"
  },
  {
    name: "Grill",
    img: "/images/cuisines/Grill.png",
    description: "Smoky charcoal-grilled meats and vegetables prepared with aromatic marinades.",
    altText: "Assorted charcoal-grilled kebabs and meats"
  },
  {
    name: "Shawaya",
    img: "/images/cuisines/Shawaya.png",
    description: "Succulent rotisserie-style grilled chicken, a favorite local comfort food.",
    altText: "Rotisserie grilled Shawaya chicken with rice"
  },
  {
    name: "Shawarma",
    img: "/images/cuisines/Shawarma.png",
    description: "Classic thinly sliced meat wrap with tahini, garlic sauce, and fresh pickles.",
    altText: "Freshly rolled meat and chicken shawarma wraps"
  },
  {
    name: "Pizza",
    img: "/images/cuisines/Pizza.png",
    description: "Classic Italian-style and specialty pizzas with fresh toppings and melty cheese.",
    altText: "Freshly baked pizza with pepperoni and extra cheese"
  },
  {
    name: "Burger",
    img: "/images/cuisines/Burger.png",
    description: "Juicy beef and chicken burgers with premium toppings in soft toasted buns.",
    altText: "Gourmet beef burger with fresh lettuce and tomato"
  },
  {
    name: "Sandwich",
    img: "/images/cuisines/Sandwich.png",
    description: "A wide variety of cold and hot sandwiches for a quick and tasty meal.",
    altText: "Club sandwich with layers of fresh ingredients"
  },
  {
    name: "Bakes",
    img: "/images/cuisines/Bakes.png",
    description: "Freshly baked pastries, breads, and savory treats from the oven.",
    altText: "Assorted freshly baked pastries and breads"
  },
  {
    name: "Juice",
    img: "/images/cuisines/Juice.png",
    description: "Refreshing natural fruit juices and tropical blends made from fresh produce.",
    altText: "Glass of fresh tropical fruit juice"
  },
  {
    name: "Falooda",
    img: "/images/cuisines/Falooda.png",
    description: "Cold and refreshing Indian dessert drink with vermicelli and rose syrup.",
    altText: "Traditional royal Falooda with ice cream and nuts"
  },
  {
    name: "Ice Cream",
    img: "/images/cuisines/Ice Cream.png",
    description: "Assorted flavors of creamy ice cream and chilled dairy treats.",
    altText: "Scoops of colorful ice cream in a bowl"
  },
  {
    name: "Dessert",
    img: "/images/cuisines/Desserts.png",
    description: "Sweet endings including traditional Arabic sweets and international cakes.",
    altText: "Platter of assorted sweet treats and desserts"
  },
  {
    name: "Healthy",
    img: "/images/cuisines/Healthy.png",
    description: "Nutritious and balanced meals designed for health-conscious diners.",
    altText: "Fresh healthy salad bowl with nutritious ingredients"
  },
  {
    name: "Pakistani",
    img: "/images/cuisines/PakFood.png",
    description: "Rich and flavorful Pakistani curries, biryanis, and traditional clay-oven breads.",
    altText: "Authentic Pakistani Biryani and Karahi dishes"
  },
  {
    name: "South Indian",
    img: "/images/cuisines/South Indian.png",
    description: "Vibrant flavors from Southern India, including Dosa, Idli, and coconut-based curries.",
    altText: "Crispy Masala Dosa with Chutneys and Sambar"
  },
  {
    name: "North Indian",
    img: "/images/cuisines/North Indian.png",
    description: "Classic North Indian delights like Butter Chicken, Naan, and aromatic Pulaos.",
    altText: "North Indian thali with Paneer and Naan bread"
  },
  {
    name: "Philipino",
    img: "/images/cuisines/Philipino.png",
    description: "Home-style Filipino favorites focusing on adobo, sinigang, and grilled specialties.",
    altText: "Traditional Filipino Adobo dish with rice"
  },
  {
    name: "Chinese",
    img: "/images/cuisines/Chinese.png",
    description: "Classic Indo-Chinese and authentic flavors including noodles, dim sums, and stir-fries.",
    altText: "Sizzling Chinese noodles and stir-fried vegetables"
  },
  {
    name: "Italian",
    img: "/images/cuisines/Italian.png",
    description: "Authentic Italian pastas, risottos, and Mediterranean-inspired dishes.",
    altText: "Plate of fresh spaghetti with basil and tomato sauce"
  },
  {
    name: "Thai",
    img: "/images/cuisines/Thai.png",
    description: "Perfect balance of sweet, sour, and spicy flavors in authentic Thai curries and soups.",
    altText: "Spicy and aromatic Thai Green Curry"
  },
  {
    name: "Sadya",
    img: "/images/cuisines/Sadhya.png",
    description: "Traditional Kerala feast served on a banana leaf with a variety of vegetarian dishes.",
    altText: "Grand Kerala Onam Sadya feast on banana leaf"
  },
  {
    name: "Coffee",
    img: "/images/cuisines/Coffee.png",
    description: "Premium brewed coffee, espresso drinks, and aromatic specialty blends.",
    altText: "Cup of hot latte with latte art"
  },
  {
    name: "Tea",
    img: "/images/cuisines/Tea.png",
    description: "Selection of aromatic teas, from classic Karak to herbal and specialty infusions.",
    altText: "Steaming cup of traditional Karak tea"
  },
];

export const locationOptions = [
  "All",
  "Doha, West Bay",
  "Dubai Mall, Dubai",
  "Doha, Pearl Qatar",
  "City Centre Doha",
  "Doha, Business District",
  "Marina Walk, Dubai",
  "Villaggio Mall, Doha",
  "Dubai, Al Barsha",
];

export const offerTypeOptions = [
  "All",
  "Buffet",
  "Combo",
  "Happy Hour",
  "Special",
  "Catering",
  "Discount",
];

export const countryMap = {
  Qatar: "Qatar",
  UAE: "UAE",
  Bahrain: "Bahrain",
  Kuwait: "Kuwait",
  'Saudi Arabia': "Saudi Arabia",
};

export default {
  cuisineOptions,
  locationOptions,
  offerTypeOptions,
  countryMap,
  cuisineLists,
};

export {
  DEFAULT_COUNTRY,
  DEFAULT_CATEGORY,
  SHOW_PRODUCTS,
  SHOW_COUPONS,
  SHOW_ENTERTAINMENT,
  SHOW_FINANCIAL_SERVICE,
  SHOW_OFFERS,
  SHOW_OFFER_TYPE_FILTER,
  SHOW_OFFER_DETAIL,
  SHOW_OFFER_AVATAR,
  ENQUIRY_EMAIL,
  ENQUIRY_PHONE,
  SHOW_CUISINE_NAV,
  SHOW_DISCOUNTED_PRICE,
  LOG_API_RESPONSE,
  AUTH_PROVIDER,
  ENABLE_SIGNUP,
  ENABLE_RANDOM_SORT,
  RESTAURANT_SORT_CONFIG,
  SHOW_VERTICAL_NAV,
};

