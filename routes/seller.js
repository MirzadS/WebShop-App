const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const customerController = require("../controllers/customerController");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../middlewares/roles_list");
const path = require("path");
const multer = require("multer");

// SAMO TRGOVAC IMA PRISTUP
router.use(verifyRoles([ROLES_LIST.SELLER]));

const upload = multer({ storage: sellerController.storage });

router.get("/", sellerController.articleList);
router.post("/", sellerController.articleListPOST);
router.post("/filtriranje", sellerController.articleListFilteringPOST);

router.get("/statistika", sellerController.sellerStatistics);

router.get("/novi-artikal", sellerController.newArticle);
router.post("/novi-artikal", upload.array("image"), sellerController.newArticlePOST);

router.patch("/artikal/brisanje", sellerController.articleDeletePost);
router.get("/artikal/:artikal_id", sellerController.articleOverview);

router.get("/azuriranje-artikla/:artikal_id", sellerController.articleUpdate);
router.post("/azuriranje-artikla", sellerController.articleUpdatePOST);
router.post("/azuriranje-artikla/:artikal_id", upload.array("image"), sellerController.newArticlePhotoPOST);

router.get("/profil", sellerController.sellerProfile);
router.post("/profil", sellerController.sellerProfilePOST);
router.post("/profil/slika", upload.single("image"), sellerController.sellerProfileImagePOST);

router.get("/narudzbe", sellerController.sellerOrderInfo);
router.patch("/narudzbe", sellerController.sellerOrderInfoPATCH, sellerController.sendingEmail);

router.get("/chat", sellerController.chatList);
// router.get("/chat/:room", sellerController.chat);
router.get("/chat/:room", customerController.chat);

module.exports = router;
