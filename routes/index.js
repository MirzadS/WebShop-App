const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

router.get("/", (req, res, next) => {
  res.status(200).redirect("/login");
});

router.get("/login", indexController.loginForm);
router.post("/login", indexController.loginAuthentication, indexController.sendToken);

router.get("/registracija", indexController.registrationInfo);

router.get("/registracija/kupac", indexController.customerRegistration);
router.post("/registracija/kupac", indexController.customerRegistrationPOST);

router.get("/registracija/trgovac", indexController.sellerRegistration);
router.post("/registracija/trgovac", indexController.sellerRegistrationPOST);

// router.post("/registracija/admin", indexController.adminRegistrationPOST);

router.get("/logout", indexController.userlogout);

module.exports = router;
