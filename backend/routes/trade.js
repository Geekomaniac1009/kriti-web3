const express = require("express");
const { buyCredits, sellCredits } = require("../controllers/tradeController");
const router = express.Router();

router.post("/buy", buyCredits);
router.post("/sell", sellCredits);

module.exports = router;
