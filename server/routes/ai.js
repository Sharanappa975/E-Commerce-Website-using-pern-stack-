const router = require("express").Router();
const { recommendProducts, semanticSearch, chatAssistant } = require("../controllers/ai.controller");

router.post("/recommend", recommendProducts);
router.post("/search", semanticSearch);
router.post("/chat", chatAssistant);

module.exports = router;
