/* Seed catalog — categories, products, demo reviews & user. */

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;
const pxx = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

export const HERO_IMG = "https://images.pexels.com/photos/30191517/pexels-photo-30191517.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export const SEED_CATEGORIES: Array<{
  id: number; name: string; slug: string; parentId: number | null; tagline?: string; image?: string; sortOrder: number;
}> = [
  { id: 1, name: "Equipment", slug: "equipment", parentId: null, tagline: "Dumbbells to cardio machines", image: px(34761566), sortOrder: 1 },
  { id: 2, name: "Supplements", slug: "supplements", parentId: null, tagline: "Whey, pre-workout, vitamins", image: pxx(36429467), sortOrder: 2 },
  { id: 3, name: "Apparel", slug: "apparel", parentId: null, tagline: "Train-ready clothing & shoes", image: px(3927385), sortOrder: 3 },
  { id: 4, name: "Accessories", slug: "accessories", parentId: null, tagline: "Bands, mats, shakers & more", image: px(4397841), sortOrder: 4 },
  { id: 5, name: "Wearables", slug: "wearables", parentId: null, tagline: "Smartwatches & trackers", image: px(3927387), sortOrder: 5 },
  { id: 11, name: "Dumbbells & Weights", slug: "dumbbells-weights", parentId: 1, sortOrder: 11 },
  { id: 12, name: "Benches & Racks", slug: "benches-racks", parentId: 1, sortOrder: 12 },
  { id: 13, name: "Cardio Machines", slug: "cardio-machines", parentId: 1, sortOrder: 13 },
  { id: 21, name: "Whey Protein", slug: "whey-protein", parentId: 2, sortOrder: 21 },
  { id: 22, name: "Gainers & Pre-Workout", slug: "gainers-preworkout", parentId: 2, sortOrder: 22 },
  { id: 23, name: "Vitamins & Wellness", slug: "vitamins-wellness", parentId: 2, sortOrder: 23 },
  { id: 31, name: "Training Tops", slug: "training-tops", parentId: 3, sortOrder: 31 },
  { id: 32, name: "Bottoms", slug: "bottoms", parentId: 3, sortOrder: 32 },
  { id: 33, name: "Footwear", slug: "footwear", parentId: 3, sortOrder: 33 },
  { id: 41, name: "Bands & Ropes", slug: "bands-ropes", parentId: 4, sortOrder: 41 },
  { id: 42, name: "Yoga & Mobility", slug: "yoga-mobility", parentId: 4, sortOrder: 42 },
  { id: 43, name: "Gym Essentials", slug: "gym-essentials", parentId: 4, sortOrder: 43 },
  { id: 51, name: "Smartwatches", slug: "smartwatches", parentId: 5, sortOrder: 51 },
  { id: 52, name: "Fitness Bands", slug: "fitness-bands", parentId: 5, sortOrder: 52 },
];

export type SeedProduct = {
  key: string;
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
};

const M = "muscle_gain";
const W = "weight_loss";
const G = "general_fitness";

export const SEED_PRODUCTS: SeedProduct[] = [
  // ---------- EQUIPMENT ----------
  { key: "p1", name: "Kore PVC 20kg Adjustable Dumbbell Set", description: "Home-gym staple: 20kg of PVC-coated plates with ergonomic rods, locks and a carry case — everything for progressive overload at home.", categoryId: 11, price: 2299, discountPrice: 1499, stockQty: 84, brand: "Kore", images: [px(8032748), px(8032962)], badgeTags: ["bestseller"], specs: [["Weight", "20 kg (adjustable)"], ["Coating", "PVC, floor-safe"], ["Includes", "2 rods, 12 plates, locks"]], goals: [M, G], ratingAvg: 4.4, ratingCount: 12840, sold: 8920 },
  { key: "p2", name: "BoldFit 24kg Hex Rubber Dumbbell (Pair)", description: "Commercial-grade hex dumbbells with knurled steel handles — no roll, no rust, all grip.", categoryId: 11, price: 7999, discountPrice: 5499, stockQty: 7, brand: "BoldFit", images: [px(8032962)], badgeTags: ["limited"], specs: [["Weight", "24 kg × 2"], ["Handle", "Knurled alloy steel"], ["Head", "Rubber hex, anti-roll"]], goals: [M], ratingAvg: 4.6, ratingCount: 3211, sold: 2140 },
  { key: "p3", name: "Strauss Cast Iron Kettlebell 12kg", description: "Single-piece cast iron bell with a wide flat base — perfect for swings, goblet squats and Turkish get-ups.", categoryId: 11, price: 1799, discountPrice: 1249, stockQty: 46, brand: "Strauss", images: [px(14502821)], badgeTags: [], specs: [["Weight", "12 kg"], ["Material", "Cast iron"], ["Base", "Flat, anti-wobble"]], goals: [M, W], ratingAvg: 4.3, ratingCount: 5876, sold: 3110 },
  { key: "p4", name: "Fitkit Rubber Kettlebell 16kg", description: "Floor-friendly rubberised 16kg bell for high-rep conditioning circuits.", categoryId: 11, price: 2299, discountPrice: 1649, stockQty: 29, brand: "Fitkit", images: [px(14623674)], badgeTags: ["new"], specs: [["Weight", "16 kg"], ["Finish", "Rubber coated"], ["Grip", "35mm textured"]], goals: [W, M], ratingAvg: 4.2, ratingCount: 1432, sold: 760 },
  { key: "p5", name: "Lifelong Olympic Barbell + 40kg Plate Combo", description: "7ft Olympic bar with 40kg of rubber-grip plates — the backbone of a serious home setup.", categoryId: 11, price: 9999, discountPrice: 7499, stockQty: 18, brand: "Lifelong", images: [px(6628962)], badgeTags: ["flash"], specs: [["Bar", "7 ft, 20 kg"], ["Plates", "40 kg rubber-grip"], ["Sleeves", "50 mm Olympic"]], goals: [M], ratingAvg: 4.5, ratingCount: 2087, sold: 1120 },
  { key: "p6", name: "Kore PVC Home Gym Combo 50kg", description: "Complete starter stack: 50kg plates, 2 dumbbell rods, 1 curl bar and 1 straight bar.", categoryId: 11, price: 5499, discountPrice: 3899, stockQty: 34, brand: "Kore", images: [px(32610333)], badgeTags: ["bestseller"], specs: [["Total weight", "50 kg"], ["Rods", "2 DB + 2 barbells"], ["Case", "Included"]], goals: [M, G], ratingAvg: 4.3, ratingCount: 9654, sold: 6230 },
  { key: "p7", name: "Reach Flat Utility Weight Bench", description: "300kg-rated flat bench with high-density foam — stable base for presses, rows and step-ups.", categoryId: 12, price: 5999, discountPrice: 3999, stockQty: 22, brand: "Reach", images: [px(32610333)], badgeTags: [], specs: [["Load rating", "300 kg"], ["Pad", "5 cm high-density"], ["Assembly", "20 min, tools included"]], goals: [M], ratingAvg: 4.2, ratingCount: 1876, sold: 940 },
  { key: "p8", name: "Fitkit FT200 Motorized Treadmill 4.5HP", description: "Peak 4.5HP DC motor, 16km/h top speed, 15-level auto incline and a wide anti-skid belt — runs quiet enough for apartments.", categoryId: 13, price: 32000, discountPrice: 23999, stockQty: 11, brand: "Fitkit", images: [px(5411023)], badgeTags: ["bestseller", "flash"], specs: [["Motor", "4.5 HP peak DC"], ["Speed", "1–16 km/h"], ["Incline", "15-level auto"], ["Belt", "1260 × 440 mm"]], goals: [W, G], ratingAvg: 4.4, ratingCount: 4102, sold: 2380 },
  { key: "p9", name: "Reach AB-110 Air Bike Exercise Cycle", description: "Full-body air bike with moving handles, adjustable seat and an LCD that tracks time, distance and calories.", categoryId: 13, price: 8999, discountPrice: 6249, stockQty: 26, brand: "Reach", images: [px(35215421)], badgeTags: [], specs: [["Resistance", "Air (unlimited)"], ["Seat", "Height adjustable"], ["Display", "LCD, 5 metrics"]], goals: [W], ratingAvg: 4.1, ratingCount: 6611, sold: 3910 },
  { key: "p10", name: "Lifelong Elliptical Cross Trainer Pro", description: "Low-impact 8-level magnetic resistance elliptical with pulse sensors on the handles.", categoryId: 13, price: 18999, discountPrice: 14999, stockQty: 0, brand: "Lifelong", images: [px(29149082)], badgeTags: ["limited"], specs: [["Resistance", "8-level magnetic"], ["Stride", "14 in"], ["Sensors", "Pulse, LCD"]], goals: [W, G], ratingAvg: 4.0, ratingCount: 1247, sold: 640 },

  // ---------- SUPPLEMENTS ----------
  { key: "p11", name: "MuscleBlaze Biozyme Whey Protein 2kg (Chocolate)", description: "India's first clinically tested whey with 50% higher protein absorption — 25g protein per scoop, Informed Choice certified.", categoryId: 21, price: 4999, discountPrice: 3299, stockQty: 64, brand: "MuscleBlaze", images: [pxx(36429468)], badgeTags: ["bestseller"], specs: [["Protein", "25 g / scoop"], ["Servings", "60"], ["Certification", "Informed Choice"]], goals: [M], ratingAvg: 4.7, ratingCount: 23410, sold: 12430 },
  { key: "p12", name: "AS-IT-IS Whey Protein Concentrate 1kg (Unflavoured)", description: "Single-ingredient 80% whey concentrate — no flavours, no additives, no nonsense.", categoryId: 21, price: 2499, discountPrice: 1899, stockQty: 91, brand: "AS-IT-IS", images: [px(5236668)], badgeTags: ["bestseller"], specs: [["Protein", "24 g / scoop"], ["Servings", "33"], ["Flavour", "Unflavoured"]], goals: [M, G], ratingAvg: 4.5, ratingCount: 18932, sold: 9870 },
  { key: "p13", name: "Optimum Nutrition Gold Standard Isolate 900g", description: "Hydrolysed whey isolate for rapid post-workout recovery — fast-absorbing, low lactose.", categoryId: 21, price: 6499, discountPrice: 5199, stockQty: 17, brand: "Optimum Nutrition", images: [px(31555272)], badgeTags: ["flash"], specs: [["Protein", "27 g / scoop"], ["Servings", "30"], ["Type", "Whey isolate"]], goals: [M, W], ratingAvg: 4.6, ratingCount: 7421, sold: 3140 },
  { key: "p14", name: "BigMuscles Critical Mass Gainer 3kg", description: "1:3 protein-to-carb mass gainer with 27 vitamins & minerals — built for hard gainers.", categoryId: 22, price: 3299, discountPrice: 2299, stockQty: 43, brand: "BigMuscles", images: [px(15120889)], badgeTags: [], specs: [["Calories", "462 / serving"], ["Protein", "18 g / serving"], ["Weight", "3 kg"]], goals: [M], ratingAvg: 4.2, ratingCount: 9114, sold: 4760 },
  { key: "p15", name: "MuscleBlaze CreaPRO Creatine Monohydrate 250g", description: "Micronised creatine monohydrate — 3g a day for strength, power and lean mass.", categoryId: 22, price: 999, discountPrice: 649, stockQty: 120, brand: "MuscleBlaze", images: [px(6551143)], badgeTags: ["bestseller"], specs: [["Serving", "3 g"], ["Servings", "83"], ["Purity", "99.9% micronised"]], goals: [M], ratingAvg: 4.5, ratingCount: 15782, sold: 8230 },
  { key: "p16", name: "MuscleTech Nitro Surge Pre-Workout (Fruit Punch)", description: "300mg caffeine + 3g citrulline per scoop — skin-splitting pumps and tunnel-vision focus.", categoryId: 22, price: 1899, discountPrice: 1249, stockQty: 8, brand: "MuscleTech", images: [px(4378525)], badgeTags: ["limited", "flash"], specs: [["Caffeine", "300 mg / scoop"], ["Citrulline", "3 g"], ["Servings", "30"]], goals: [M, G], ratingAvg: 4.3, ratingCount: 5217, sold: 2890 },
  { key: "p17", name: "MuscleBlaze BCAA Pro 450g (Watermelon)", description: "7g BCAAs in the 2:1:1 ratio with electrolytes — intra-workout recovery that actually tastes good.", categoryId: 22, price: 1499, discountPrice: 999, stockQty: 52, brand: "MuscleBlaze", images: [px(15120889)], badgeTags: [], specs: [["BCAA", "7 g 2:1:1"], ["Servings", "30"], ["Extras", "Electrolyte blend"]], goals: [M, G], ratingAvg: 4.4, ratingCount: 6931, sold: 3540 },
  { key: "p18", name: "HealthKart Multivitamin with Ginseng 60 Tablets", description: "25 vitamins & minerals plus ginseng extract — one tablet a day for training recovery and immunity.", categoryId: 23, price: 699, discountPrice: 449, stockQty: 140, brand: "HealthKart", images: [pxx(36429467)], badgeTags: ["bestseller"], specs: [["Count", "60 tablets"], ["Blend", "25 micronutrients"], ["Plus", "Ginseng extract"]], goals: [G, M], ratingAvg: 4.3, ratingCount: 11218, sold: 7450 },
  { key: "p19", name: "TrueBasics Omega-3 Fish Oil 1000mg (90 Capsules)", description: "Triple-strength EPA/DHA for joint, heart and brain health — mercury-tested, no fishy burps.", categoryId: 23, price: 1099, discountPrice: 749, stockQty: 76, brand: "TrueBasics", images: [pxx(36429467)], badgeTags: ["new"], specs: [["Omega-3", "1000 mg / cap"], ["Count", "90 capsules"], ["EPA:DHA", "3:2"]], goals: [G], ratingAvg: 4.4, ratingCount: 4876, sold: 2620 },
  { key: "p20", name: "Fast&Up Vitamin C + Zinc Effervescent (20 Tabs)", description: "1000mg vitamin C with zinc in fast-absorbing effervescent form — daily immunity, zero sugar.", categoryId: 23, price: 399, discountPrice: 249, stockQty: 210, brand: "Fast&Up", images: [pxx(36429467)], badgeTags: [], specs: [["Vitamin C", "1000 mg"], ["Zinc", "10 mg"], ["Form", "Effervescent"]], goals: [G, W], ratingAvg: 4.2, ratingCount: 3154, sold: 1980 },
  { key: "p21", name: "GNC Pro Performance 100% Whey 2kg (Vanilla)", description: "24g fast-digesting whey per serving with 5.5g BCAAs — smooth vanilla that blends clean.", categoryId: 21, price: 5499, discountPrice: 3999, stockQty: 33, brand: "GNC", images: [px(31555272)], badgeTags: [], specs: [["Protein", "24 g / scoop"], ["BCAA", "5.5 g"], ["Servings", "57"]], goals: [M], ratingAvg: 4.3, ratingCount: 2987, sold: 1610 },

  // ---------- APPAREL ----------
  { key: "p22", name: "HRX Rapid-Dry Training T-Shirt (Jet Black)", description: "Featherlight sweat-wicking tee with 4-way stretch — survives leg day and laundry day equally well.", categoryId: 31, price: 999, discountPrice: 549, stockQty: 150, brand: "HRX", images: [px(4398348)], badgeTags: ["bestseller"], specs: [["Fabric", "90% poly, 10% spandex"], ["Fit", "Athletic"], ["Care", "Machine wash"]], goals: [G, M], ratingAvg: 4.4, ratingCount: 8765, sold: 5120 },
  { key: "p23", name: "CultSport Formodo Training Tee (Heather Grey)", description: "Anti-odour cotton-touch training tee with mesh ventilation zones.", categoryId: 31, price: 799, discountPrice: 479, stockQty: 180, brand: "CultSport", images: [px(4398348)], badgeTags: ["new"], specs: [["Fabric", "Cotton-touch poly"], ["Zones", "Mesh vent panels"], ["Fit", "Regular"]], goals: [G], ratingAvg: 4.2, ratingCount: 1876, sold: 940 },
  { key: "p24", name: "HRX Flex-Knit Training Shorts (Navy)", description: "Lightweight 2-in-1 compression shorts with zip pocket — squat-proof and pocket-proof.", categoryId: 32, price: 899, discountPrice: 499, stockQty: 132, brand: "HRX", images: [px(3838339)], badgeTags: [], specs: [["Fabric", "Flex-knit woven"], ["Pockets", "1 zip + 1 drop-in"], ["Length", "7 in inseam"]], goals: [G, M], ratingAvg: 4.3, ratingCount: 4321, sold: 2740 },
  { key: "p25", name: "Reach Velocity Training Shoes (Charcoal)", description: "Stable flat-base trainers with reinforced lateral cage — built for lifting days, not just treadmill selfies.", categoryId: 33, price: 2999, discountPrice: 1799, stockQty: 44, brand: "Reach", images: [px(3927385)], badgeTags: ["flash"], specs: [["Drop", "4 mm"], ["Sole", "Grip rubber, flat base"], ["Upper", "Breathable knit"]], goals: [M, G], ratingAvg: 4.5, ratingCount: 2876, sold: 1430 },

  // ---------- ACCESSORIES ----------
  { key: "p26", name: "BoldFit Resistance Bands Set of 5 (5–40kg)", description: "Five stackable latex bands from 5kg to 40kg with handles, ankle straps and a door anchor — a full gym in a pouch.", categoryId: 41, price: 1299, discountPrice: 699, stockQty: 95, brand: "BoldFit", images: [px(4397836), px(36400032)], badgeTags: ["bestseller"], specs: [["Levels", "5–40 kg stackable"], ["Includes", "Handles, straps, anchor"], ["Material", "Natural latex"]], goals: [G, W, M], ratingAvg: 4.5, ratingCount: 14321, sold: 8940 },
  { key: "p27", name: "Strauss Anti-Skid Yoga Mat 6mm (Teal)", description: "6mm anti-tear TPE mat with double-side texture — grippy when sweaty, kind to knees.", categoryId: 42, price: 999, discountPrice: 649, stockQty: 118, brand: "Strauss", images: [px(6932262)], badgeTags: ["bestseller"], specs: [["Thickness", "6 mm"], ["Size", "183 × 61 cm"], ["Material", "TPE, anti-tear"]], goals: [G, W], ratingAvg: 4.4, ratingCount: 10284, sold: 6810 },
  { key: "p28", name: "Lifelong Digital-Count Skipping Rope", description: "Ball-bearing speed rope with a built-in jump counter — cardio you can do in a 6×6 room.", categoryId: 41, price: 499, discountPrice: 299, stockQty: 164, brand: "Lifelong", images: [px(6390234)], badgeTags: [], specs: [["Counter", "Digital LCD"], ["Cable", "Adjustable 3 m"], ["Handles", "Foam grip"]], goals: [W, G], ratingAvg: 4.1, ratingCount: 5876, sold: 3420 },
  { key: "p29", name: "BoldFit Gym Gloves with Wrist Wrap (M/L/XL)", description: "Padded micro-mesh gloves with integrated wrist support — grip heavy bars without tearing up your palms.", categoryId: 43, price: 699, discountPrice: 399, stockQty: 87, brand: "BoldFit", images: [px(14623669)], badgeTags: [], specs: [["Padding", "8 mm gel"], ["Wrist", "Integrated wrap"], ["Sizes", "M / L / XL"]], goals: [M, G], ratingAvg: 4.2, ratingCount: 6543, sold: 3980 },
  { key: "p30", name: "Fitkit 700ml Steel Shaker with Blender Ball", description: "Leak-proof double-wall steel shaker that keeps your shake cold for 6 hours — zero clumps, zero smell.", categoryId: 43, price: 699, discountPrice: 399, stockQty: 203, brand: "Fitkit", images: [px(4378525)], badgeTags: ["bestseller"], specs: [["Capacity", "700 ml"], ["Build", "304 stainless steel"], ["Extra", "Blender ball included"]], goals: [M, G, W], ratingAvg: 4.6, ratingCount: 11874, sold: 9810 },
  { key: "p31", name: "BoldFit 30L Gym Duffel with Shoe Compartment", description: "Water-resistant 30L duffel with ventilated shoe pocket and wet-garment sleeve — gym-to-office approved.", categoryId: 43, price: 1299, discountPrice: 849, stockQty: 58, brand: "BoldFit", images: [px(4397841)], badgeTags: ["new"], specs: [["Volume", "30 L"], ["Pockets", "Shoe + wet + bottle"], ["Fabric", "Water-resistant poly"]], goals: [G], ratingAvg: 4.3, ratingCount: 2187, sold: 1140 },
  { key: "p32", name: "Strauss Foam Roller 33cm (High Density)", description: "EVA high-density roller for myofascial release — the cheapest physio session you'll ever buy.", categoryId: 42, price: 1099, discountPrice: 799, stockQty: 66, brand: "Strauss", images: [px(4498549)], badgeTags: [], specs: [["Length", "33 cm"], ["Density", "High, EVA"], ["Load", "Up to 150 kg"]], goals: [G, M], ratingAvg: 4.4, ratingCount: 3421, sold: 1760 },
  { key: "p33", name: "BoldFit Hand Grip Strengthener (10–60kg)", description: "Adjustable-resistance gripper for forearms that match your biceps.", categoryId: 41, price: 449, discountPrice: 249, stockQty: 142, brand: "BoldFit", images: [px(8032962)], badgeTags: [], specs: [["Resistance", "10–60 kg"], ["Counter", "Mechanical"], ["Grip", "TPR anti-slip"]], goals: [M], ratingAvg: 4.2, ratingCount: 7654, sold: 4970 },
  { key: "p34", name: "Strauss Wrist & Ankle Weights 2 × 1kg (Pair)", description: "Neoprene strap-on weights for walking, pilates and shadow boxing.", categoryId: 41, price: 799, discountPrice: 499, stockQty: 73, brand: "Strauss", images: [px(4397841)], badgeTags: [], specs: [["Weight", "1 kg × 2"], ["Strap", "Velcro, adjustable"], ["Fabric", "Soft neoprene"]], goals: [W, G], ratingAvg: 4.1, ratingCount: 2876, sold: 1530 },

  // ---------- WEARABLES ----------
  { key: "p35", name: "Noise ColorFit Pro 5 Smartwatch (1.85\")", description: "1.85\" AMOLED display, BT calling, 100+ sport modes and 7-day battery — tracks every rep and every rest day.", categoryId: 51, price: 4999, discountPrice: 2499, stockQty: 39, brand: "Noise", images: [px(3927387)], badgeTags: ["new", "flash"], specs: [["Display", "1.85\" AMOLED"], ["Battery", "7 days"], ["Modes", "100+ sports"]], goals: [G, W, M], ratingAvg: 4.3, ratingCount: 18765, sold: 11250 },
  { key: "p36", name: "Fastrack Reflex Beat+ Fitness Band", description: "Slim AMOLED band with 24×7 heart rate, SpO2 and sleep tracking.", categoryId: 52, price: 2499, discountPrice: 1499, stockQty: 55, brand: "Fastrack", images: [px(3927387)], badgeTags: [], specs: [["Display", "1.1\" AMOLED"], ["Tracking", "HR, SpO2, sleep"], ["Battery", "10 days"]], goals: [W, G], ratingAvg: 4.1, ratingCount: 5421, sold: 2840 },
  { key: "p37", name: "Fitkit Pulse HRM Chest Strap", description: "Bluetooth + ANT+ chest strap with gym-machine-grade accuracy for serious heart-rate zone training.", categoryId: 52, price: 3299, discountPrice: 2299, stockQty: 15, brand: "Fitkit", images: [px(3927387)], badgeTags: ["limited"], specs: [["Protocol", "BT 5.0 + ANT+"], ["Battery", "CR2032, 12 mo"], ["Strap", "Soft, M–XXL"]], goals: [M, W], ratingAvg: 4.4, ratingCount: 876, sold: 410 },
];

export const REVIEW_SNIPPETS: Array<{ names: string[]; comments: string[] }> = [
  {
    names: ["Aarav Mehta", "Priya Sharma", "Vikram Singh"],
    comments: [
      "Solid value for the price. Have been using it daily for 3 weeks now and zero complaints. Delivery to Bangalore took 3 days.",
      "Exactly as described. Quality feels premium for this price point — my trainer approved it too.",
      "Good product overall, packaging could be better but nothing was damaged. Would buy again on GymKart.",
    ],
  },
  {
    names: ["Sneha Iyer", "Rahul Verma", "Ananya Gupta"],
    comments: [
      "Second time ordering this. Genuinely helped my routine — noticeable difference within two weeks.",
      "Authentic product with proper seal and batch verification. Tastes/performs as expected.",
      "Was skeptical about ordering online but the reviews were right. Excellent purchase.",
    ],
  },
  {
    names: ["Karan Patel", "Divya Nair", "Arjun Reddy"],
    comments: [
      "Using this for my home workouts since a month. Build quality is impressive, no wobble or squeaks.",
      "Setup took 15 minutes. Sturdy and does the job well — great for compact apartments.",
      "Worth every rupee. Compared prices everywhere, GymKart had the best deal with genuine product.",
    ],
  },
];

export const SEED_REVIEW_PRODUCTS = ["p1", "p5", "p8", "p11", "p15", "p22", "p26", "p30", "p35"];
