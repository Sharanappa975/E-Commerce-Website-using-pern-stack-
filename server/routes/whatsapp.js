const router = require("express").Router();
const { whatsappWebhook, sendWhatsappMessage } = require("../controllers/whatsapp.controller");

router.post("/", whatsappWebhook);
router.post("/send", sendWhatsappMessage);

module.exports = router;
