const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../middlewares/roles_list");
const customerController = require("../controllers/customerController");

// SAMO KUPAC IMA PRISTUP
router.use(verifyRoles([ROLES_LIST.CUSTOMER]));

router.get("/", customerController.customerArticleList);
router.post("/", customerController.customerArticleListPOST);
router.post("/filtriranje", customerController.articleListFilteringPOST);
router.post("/sortiranje", customerController.articleListSortingPOST);

router.post("/trgovac/profil", customerController.sellerProfileArticleListPOST);

// SPASENI ARTIKLI
router.get("/spaseni-artikli", customerController.savedItems);
router.post("/spaseni-artikli", customerController.savedItemsPOST);

// CHAT
router.get("/chat", customerController.chatList);
router.get("/chat/:room", customerController.chat);

// PROFIL TRGOVCA
router.get("/trgovac/profil/:trgovac_id", customerController.sellerProfile);

// OCJENA TRGOVCA
router.get("/trgovac/:trgovac_id/ocjena", customerController.sellerFeedback);
router.post("/trgovac/ocjena", customerController.sellerFeedbackPOST);

// OCJENA ARTIKLA
router.get("/artikal/:artikal_id", customerController.articleOverview);
router.get("/artikal/:artikal_id/ocjena", customerController.reviewsAndRatings);
router.post("/artikal/ocjena", customerController.reviewsAndRatingsPOST);

// NARUDZBE
router.post("/korpa/narudzba", customerController.orderMultipleItemsPOST, customerController.sendingEmail);
router.post("/lista/narudzba", customerController.orderOneItemPOST, customerController.sendingEmail);

router.get("/narudzbe", customerController.customerOrderInfo);
router.patch("/narudzbe", customerController.customerOrderInfoPATCH);

// KORPA
router.get("/korpa", customerController.articleCart);
router.patch("/korpa", customerController.articleCartPATCH);
router.post("/korpa/:artikal_id", customerController.articleCartPOST);
router.delete("/korpa/:artikal_id", customerController.articleCartDELETE);

module.exports = router;
