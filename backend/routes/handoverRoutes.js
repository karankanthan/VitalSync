const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
 createHandover,
 getHandovers,
 reviewHandover
} = require("../controllers/handoverController");

router.post("/", authMiddleware, createHandover);

router.get("/", authMiddleware, getHandovers);

router.put("/review/:id", authMiddleware, reviewHandover);

module.exports = router;