const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const adminController = require("../controllers/adminController");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../middlewares/roles_list");

// SAMO ADMIN IMA PRISTUP
router.use(verifyRoles([ROLES_LIST.ADMIN]));

router.get("/", adminController.dashboard);
router.patch("/blokiranje", adminController.blocking);
router.patch("/arhiviranje", adminController.archiving);
router.patch("/ukloni-ogranicenja", adminController.removeRestrictions);

router.patch("/kategorije", adminController.updateCategory);
router.delete("/kategorije", adminController.deleteCategory);
router.post("/kategorije", adminController.addCategory);

// CHAT
router.get("/chat", adminController.chatList);
router.get("/chat/:room", customerController.chat);

router.get("/statistika", adminController.statistics);

module.exports = router;
