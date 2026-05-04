const { MessagingResponse } = require("twilio").twiml;
const twilio = require("twilio");
const { getChatReply } = require("../ai/chat.service");
const { getSemanticResults } = require("../ai/search.service");

const buildRecommendationMessage = (products = [], title = "Recommendations") => {
  if (!products.length) return "No products found.";
  const list = products
    .slice(0, 6)
    .map((item, index) => `${index + 1}. ${item.name} (Rs.${Number(item.price).toFixed(0)})`)
    .join("\n");
  return `${title}:\n${list}`;
};

const formatProductList = (products = []) => {
  if (!products.length) return "No products found.";
  return products
    .slice(0, 6)
    .map((item, index) => `${index + 1}. ${item.name} (Rs.${Number(item.price).toFixed(0)})`)
    .join("\n");
};

const buildQuickReplyHints = () =>
  [
    "Quick options:",
    "1) Best products",
    "2) Budget items",
    "3) New arrivals",
    "4) Explain a product (e.g., explain \"US Polo Sport Hoodie\")",
    "5) Semantic search (e.g., semantic: lightweight laptop for travel)",
  ].join("\n");

const whatsappWebhook = async (req, res) => {
  try {
    const incoming = (req.body.Body || "").trim();

    const twiml = new MessagingResponse();

    if (!incoming) {
      twiml.message("Please send a message so I can help you with recommendations.\n" + buildQuickReplyHints());
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const lower = incoming.toLowerCase();
    if (lower.startsWith("semantic:") || lower.startsWith("semantic ") || lower.startsWith("search:") || lower.startsWith("search ")) {
      const query = incoming.split(/:(.+)/)[1] || incoming.replace(/^semantic\s+/i, "").replace(/^search\s+/i, "");
      const q = (query || "").trim();
      if (!q) {
        twiml.message("Please provide a semantic query. Example: semantic: lightweight laptop for travel");
      } else {
        const results = await getSemanticResults(q);
        const list = formatProductList(results);
        twiml.message(`Semantic results for "${q}":\n${list}\nReply with a number (1-6) to ask about that product.`);
      }
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const reply = await getChatReply(incoming);
    const withHints = `${reply}\n\n${buildQuickReplyHints()}`.trim();
    twiml.message(withHints);
    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (err) {
    const twiml = new MessagingResponse();
    twiml.message("Sorry, I could not process that. Please try again.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }
};

const sendWhatsappMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: "to and message are required" });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ message: "Twilio credentials missing" });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const from = process.env.TWILIO_WHATSAPP_FROM;

    const payload = {
      from,
      to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
      body: message,
    };

    const result = await client.messages.create(payload);
    return res.status(200).json({ message: "sent", sid: result.sid });
  } catch (err) {
    const errorPayload = {
      message: "failed",
      error: err.message,
      code: err.code,
      status: err.status,
      moreInfo: err.moreInfo,
    };
    console.error("Twilio send error:", errorPayload);
    return res.status(500).json(errorPayload);
  }
};

module.exports = { whatsappWebhook, sendWhatsappMessage, buildRecommendationMessage };
