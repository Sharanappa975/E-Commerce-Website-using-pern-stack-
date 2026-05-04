const { getRecommendations } = require("../ai/recommendation.service");
const { getSemanticResults } = require("../ai/search.service");
const { getChatReply } = require("../ai/chat.service");

const recommendProducts = async (req, res) => {
    try {
        const { query } = req.body;

        // 🔥 VALIDATION
        if (!query || query.trim() === "") {
            return res.status(400).json({
                message: "Query is required"
            });
        }

        const q = query.trim();
        console.log("Search Query:", q);

        const products = await getRecommendations(q);

        if (!products || products.length === 0) {
            return res.status(200).json({
                message: "Product not available",
                data: []
            });
        }

        res.status(200).json({
            message: "Products found",
            count: products.length,
            data: products
        });

    } catch (err) {
        console.error("Recommendation Error:", err.message);

        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

const semanticSearch = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                message: "Query is required"
            });
        }

        const q = query.trim();
        console.log("Semantic Query:", q);

        const products = await getSemanticResults(q);

        if (!products || products.length === 0) {
            return res.status(200).json({
                message: "No results found",
                data: []
            });
        }

        res.status(200).json({
            message: "Results found",
            count: products.length,
            data: products
        });
    } catch (err) {
        console.error("Semantic Search Error:", err.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

const chatAssistant = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const reply = await getChatReply(message.trim(), history);

        res.status(200).json({
            message: "Reply generated",
            reply
        });
    } catch (err) {
        console.error("Chat Error:", err.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

module.exports = { recommendProducts, semanticSearch, chatAssistant };
