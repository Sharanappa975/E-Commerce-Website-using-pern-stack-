const pool = require("../config");
const { getRecommendations } = require("./recommendation.service");

const greetingResponses = [
  "Hi! Tell me what product you are looking for and I will recommend options.",
  "Hello! What kind of product do you want today?",
  "Hey! Share your needs and I will suggest the best products.",
];

const isSmallTalk = (message) => {
  const q = message.toLowerCase().trim();
  const short = q.split(/\s+/).length <= 2;
  const greetings = ["hi", "hello", "hey", "hola", "namaste", "hii", "hiii"];
  const thanks = ["thanks", "thank you", "thx", "ty"];
  const bye = ["bye", "goodbye", "see you"];

  if (short && greetings.includes(q)) return "greeting";
  if (thanks.includes(q)) return "thanks";
  if (bye.includes(q)) return "bye";
  return null;
};

const isCatalogQuestion = (message) => {
  const q = message.toLowerCase().trim();
  const patterns = [
    /what\s+kind\s+of\s+products?/,
    /what\s+products?\s+do\s+you\s+have/,
    /what\s+products?\s+you\s+have/,
    /can\s+you\s+tell\s+.*products?\s+you\s+have/,
    /show\s+products?/,
    /show\s+me\s+products?/,
    /list\s+products?/,
    /what\s+items?\s+do\s+you\s+have/,
    /what\s+do\s+you\s+sell/,
    /catalog/,
    /suggest\s+best\s+product/,
    /suggest\s+best\s+products/,
    /best\s+products?/,
    /recommend\s+best\s+products?/,
    /suggest\s+products?/,
    /recommend\s+products?/,
  ];
  return patterns.some((pattern) => pattern.test(q));
};

const isLoginQuestion = (message) => {
  const q = message.toLowerCase().trim();
  const patterns = [
    /how\s+to\s+login/,
    /how\s+can\s+i\s+login/,
    /login\s+help/,
    /can\s+i\s+login/,
    /sign\s+in/,
  ];
  return patterns.some((pattern) => pattern.test(q));
};

const isPasswordRuleQuestion = (message) => {
  const q = message.toLowerCase().trim();
  const patterns = [
    /password\s+restriction/,
    /password\s+requirements?/,
    /password\s+rules?/,
    /minimum\s+password/,
    /password\s+length/,
  ];
  return patterns.some((pattern) => pattern.test(q));
};

const isResetPasswordQuestion = (message) => {
  const q = message.toLowerCase().trim();
  const patterns = [
    /forgot\s+password/,
    /reset\s+password/,
    /change\s+password/,
  ];
  return patterns.some((pattern) => pattern.test(q));
};

const isPossibleQueriesQuestion = (message) => {
  const q = message.toLowerCase().trim();
  const patterns = [
    /what\s+can\s+i\s+ask/,
    /what\s+queries\s+can\s+i\s+do/,
    /what\s+can\s+you\s+do/,
    /how\s+can\s+you\s+help/,
    /what\s+should\s+i\s+ask/,
  ];
  return patterns.some((pattern) => pattern.test(q));
};

const fetchCategories = async () => {
  const result = await pool.query(
    "SELECT DISTINCT subcategory FROM products WHERE subcategory IS NOT NULL ORDER BY subcategory ASC"
  );
  return result.rows.map((row) => row.subcategory).filter(Boolean);
};

const fetchSampleProducts = async () => {
  const result = await pool.query(
    "SELECT name, price FROM products ORDER BY RANDOM() LIMIT 5"
  );
  return result.rows;
};

const formatProducts = (products = []) =>
  products
    .slice(0, 6)
    .map((item, index) => `${index + 1}. ${item.name} (Rs.${Number(item.price).toFixed(0)})`)
    .join("\n");

const followUpQuestions = [
  "Do you want price, features, or best use cases?",
  "What is your budget range?",
  "Do you prefer premium or budget options?",
  "Is this for personal use or gifting?",
  "Any brand preference?",
  "Which category are you interested in?",
  "Do you need it for daily use, travel, or office?",
  "Any color or size preference?",
  "Do you want top-rated items or best value?",
  "How soon do you need it delivered?",
  "Which price range feels comfortable for you?",
  "Do you want the latest model or best value?",
  "Are you comparing a few options or starting fresh?",
  "Do you prefer lightweight or heavy-duty items?",
  "Should I prioritize durability or style?",
  "Do you need warranty or extended support?",
  "Is this for you or someone else?",
  "Do you want something trendy or classic?",
  "Do you want a compact size or full size?",
  "Do you need this for outdoor or indoor use?",
  "Any preferred material like leather, cotton, or metal?",
  "Do you want fast delivery or standard delivery?",
  "Do you want eco-friendly options?",
  "Do you prefer popular brands or new brands?",
  "Do you want items with discounts only?",
  "Do you want to see new arrivals?",
  "Do you want to see best sellers?",
  "Do you want low maintenance products?",
  "Do you want items that are easy to clean?",
  "Do you need something lightweight for travel?",
  "Do you want a slim design or bulky design?",
  "Do you care about energy efficiency?",
  "Do you want wireless or wired options?",
  "Do you need a long battery life?",
  "Do you want fast charging support?",
  "Do you need water resistance?",
  "Do you prefer a large screen or compact screen?",
  "Do you want more storage or more performance?",
  "Do you want a quiet product or high performance?",
  "Do you want minimalistic or feature-rich?",
  "Should I focus on comfort or style?",
  "Do you want a soft fabric or sturdy fabric?",
  "Do you need something for kids or adults?",
  "Do you want a bundle or single item?",
  "Do you want a gift-ready package?",
  "Do you want a specific color family?",
  "Do you want a specific size range?",
  "Do you want a lightweight feel or premium feel?",
  "Do you need something for office use?",
  "Do you need something for gaming?",
  "Do you need something for study or work?",
  "Do you want a product with high ratings only?",
  "Do you want top value under a budget?",
  "Do you want the newest version available?",
  "Do you want a low-cost starter option?",
  "Do you want a premium upgrade option?",
  "Do you want to compare 2-3 options?",
  "Do you prefer a certain design style?",
  "Do you want a product with accessories included?",
  "Do you want something portable?",
  "Do you want something with a sturdy build?",
  "Do you want something for everyday use?",
  "Do you want a product for occasional use?",
  "Do you want something easy to carry?",
  "Do you want something easy to store?",
  "Do you want a quiet motor or powerful motor?",
  "Do you want fast performance or balanced performance?",
  "Do you want something with smart features?",
  "Do you need compatibility with your phone?",
  "Do you need compatibility with your laptop?",
  "Do you want a simple setup or advanced setup?",
  "Do you want quick installation?",
  "Do you want a long-lasting product?",
  "Do you want a product with a premium finish?",
  "Do you want to prioritize comfort?",
  "Do you want to prioritize build quality?",
  "Do you want to prioritize portability?",
  "Do you want to prioritize battery life?",
  "Do you want to prioritize camera quality?",
  "Do you want to prioritize sound quality?",
  "Do you want to prioritize display quality?",
  "Do you want to prioritize speed?",
  "Do you want to prioritize storage?",
  "Do you want to prioritize durability?",
  "Do you want to prioritize affordability?",
  "Do you want to prioritize style?",
  "Do you want something for beginners?",
  "Do you want something for professionals?",
  "Do you want something for students?",
  "Do you want something for home use?",
  "Do you want something for office use?",
  "Do you want something for travel use?",
  "Do you want a product that is easy to maintain?",
  "Do you want a product that is easy to repair?",
  "Do you want a product with good after-sales support?",
  "Do you want a product that is lightweight and durable?",
  "Do you want a product that is stylish and functional?",
  "Do you want a product with ergonomic design?",
  "Do you want a product with multiple color options?",
  "Do you want a product with multiple size options?",
  "Do you want a product with high resale value?",
  "Do you want a product that is kid-friendly?",
  "Do you want a product that is pet-friendly?",
  "Do you want a product suitable for outdoor use?",
  "Do you want a product suitable for indoor use?",
  "Do you want a product with easy return policy?",
  "Do you want a product that is low power consumption?",
  "Do you want a product that is easy to clean?",
  "Do you want a product that is scratch resistant?",
  "Do you want a product with a long warranty?",
  "Do you want a product with a compact footprint?",
  "Do you want a product that is foldable or collapsible?",
  "Do you want a product that is quick to set up?",
  "Do you want a product with premium packaging?",
];

const buildFollowUps = (count = 4) => {
  const shuffled = [...followUpQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((q, index) => `${index + 1}. ${q}`).join("\n");
};

const buildCatalogReply = async () => {
  const categories = await fetchCategories();
  const samples = await fetchSampleProducts();

  const categoryLine = categories.length
    ? `We have products in these categories: ${categories.join(", ")}.`
    : "We have a wide range of products.";

  const sampleLine = samples.length
    ? `Sample items: ${samples.map((item) => item.name).join(", ")}.`
    : "";

  return `${categoryLine} ${sampleLine}\nHere are a few quick questions to help me suggest better:\n${buildFollowUps()}`.trim();
};

const extractProductQuery = (message) => {
  const quoted = message.match(/["??']([^"??']+)["??']/);
  if (quoted && quoted[1]) return quoted[1].trim();

  const aboutMatch = message.match(/(?:explain|describe|details?|tell me about|what is)\s+(.+)/i);
  if (aboutMatch && aboutMatch[1]) return aboutMatch[1].trim();

  if (message.toLowerCase().includes("product")) {
    const parts = message.split(/product/i);
    if (parts[1]) return parts[1].trim();
  }

  return "";
};

const getProductByNameLike = async (query) => {
  if (!query) return null;
  const result = await pool.query(
    "SELECT name, price, description FROM products WHERE name ILIKE $1 ORDER BY LENGTH(name) ASC LIMIT 1",
    [`%${query}%`]
  );
  return result.rows[0] || null;
};

const buildProductExplanation = (product) => {
  const description = (product.description || "").trim();
  const safeDescription = description.length > 0 ? description : "No description available.";
  return `Here is the product information for "${product.name}":\nPrice: Rs.${Number(
    product.price
  ).toFixed(0)}\nDescription: ${safeDescription}`;
};

const getChatReply = async (message) => {
  const smallTalk = isSmallTalk(message);
  if (smallTalk === "greeting") {
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }
  if (smallTalk === "thanks") {
    return "You are welcome! Tell me what product you want and I will help.";
  }
  if (smallTalk === "bye") {
    return "Goodbye! Come back anytime if you need product suggestions.";
  }

  if (isLoginQuestion(message)) {
    return "To login: open the Login page, enter your email and password, then click Login. If you forgot your password, use the Forgot Password link to reset it.";
  }

  if (isPasswordRuleQuestion(message)) {
    return "Password rule: minimum 6 characters. Use a stronger password with letters, numbers, and symbols for better security.";
  }

  if (isResetPasswordQuestion(message)) {
    return "To reset your password: open the Forgot Password page, enter your email, check your email for the reset link, then set a new password (minimum 6 characters).";
  }

  if (isPossibleQueriesQuestion(message)) {
    return "You can ask about: product recommendations, best products, categories, price ranges, features (camera, battery, gaming), and explanations of a specific product. Example: 'laptop under 70000', 'best headphones', 'explain \"US Polo Sport Hoodie\"'.";
  }

  if (isCatalogQuestion(message)) {
    return await buildCatalogReply();
  }

  const lower = message.toLowerCase();
  if ((lower.includes("best") || lower.includes("suggest")) && lower.split(/\s+/).length < 6) {
    return await buildCatalogReply();
  }

  if (
    lower.includes("explain") ||
    lower.includes("details") ||
    lower.includes("describe") ||
    lower.includes("tell me about") ||
    lower.startsWith("what is")
  ) {
    const query = extractProductQuery(message);
    if (!query) {
      return "Which product should I explain? Please share the exact product name.";
    }

    const product = await getProductByNameLike(query);
    if (product) {
      return buildProductExplanation(product);
    }

    return "I could not find that product. Please check the name and try again.";
  }

  const products = await getRecommendations(message);
  if (!products || products.length === 0) {
    return `I could not find a match. Try describing the product type, budget, or feature (e.g., 'laptop under 70000', 'gaming mouse').\nHere are some questions to guide you:\n${buildFollowUps()}`;
  }

  return `Here are some recommendations based on "${message}":\n${formatProducts(products)}`;
};

module.exports = { getChatReply };
