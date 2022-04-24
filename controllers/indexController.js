const pool = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");

/**
 * GET
 * LOGIN
 */

exports.loginForm = (req, res, next) => {
  res.render("index/index", { title: "Login" });
};

/**
 * POST
 * LOGIN
 * 1)
 */

exports.loginAuthentication = catchAsync(async (req, res, next) => {
  const { f_email, f_password } = req.body;

  const user = await pool.query("SELECT * FROM allUsers WHERE email = $1", [f_email]);

  if (user.rows.length == 0) {
    return res.status(400).send("Ne postoji korisnik s tim emailom!");
  }

  if (await bcrypt.compare(f_password, user.rows[0].password)) {
    if (new Date() <= user.rows[0].blocked) {
      return res.status(400).send(`Admin vas je blokirao do ${user.rows[0].blocked}.`);
    }

    req.userInfo = user.rows[0];
    next();
  } else {
    return res.status(400).send("Neispravna lozinka.");
  }
});

/**
 * POST
 * LOGIN
 * 2)
 */

exports.sendToken = (req, res, next) => {
  const tokenInfo = {
    t_user_id: req.userInfo.user_id,
    t_email: req.userInfo.email,
    t_role_id: req.userInfo.role_id,
  };

  const accessToken = jwt.sign(tokenInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

  switch (tokenInfo.t_role_id) {
    case 1:
      res.cookie("access_token", accessToken).status(200).redirect("/admin");
      break;
    case 2:
      res.cookie("access_token", accessToken).status(200).redirect("/trgovac");
      break;
    default:
      res.cookie("access_token", accessToken).status(200).redirect("/kupac");
  }
};

/**
 * GET
 * REGISTRACIJA
 */

exports.registrationInfo = (req, res, next) => {
  res.render("index/registration", { title: "Registracija" });
};

/**
 * GET
 * REGISTRACIJA / KUPAC
 */

exports.customerRegistration = (req, res, next) => {
  res.render("index/customerRegistration", { title: "Registracija kupca" });
};

/**
 * GET
 * REGISTRACIJA / TRGOVAC
 */

exports.sellerRegistration = (req, res, next) => {
  res.render("index/sellerRegistration", { title: "Registracija trgovca" });
};

/**
 * POST
 * REGISTRACIJA / KUPAC
 */

exports.customerRegistrationPOST = catchAsync(async (req, res, next) => {
  const { f_first_name, f_last_name, f_username, f_email, f_password } = req.body;

  const hashedPassword = await bcrypt.hash(f_password, 10);

  await pool.query("INSERT INTO customer(first_name, last_name, username, email, password) VALUES ($1,$2,$3,$4,$5);", [
    f_first_name,
    f_last_name,
    f_username,
    f_email,
    hashedPassword,
  ]);
  res.status(201).redirect("/login");
});

/**
 * POST
 * REGISTRACIJA / TRGOVAC
 */

exports.sellerRegistrationPOST = catchAsync(async (req, res, next) => {
  const { f_first_name, f_last_name, f_store_name, f_email, f_password } = req.body;

  const hashedPassword = await bcrypt.hash(f_password, 10);

  await pool.query("INSERT INTO seller(first_name, last_name, store_name, email, password) VALUES ($1,$2,$3,$4,$5);", [
    f_first_name,
    f_last_name,
    f_store_name,
    f_email,
    hashedPassword,
  ]);

  res.status(201).redirect("/login");
});

/**
 * GET
 * LOGOUT
 */

exports.userlogout = (req, res, next) => {
  return res.clearCookie("access_token").status(200).redirect("/login");
};

/**
 * POST
 * REGISTRACIJA / ADMIN
 */

exports.adminRegistrationPOST = catchAsync(async (req, res, next) => {
  const { f_first_name, f_last_name, f_email, f_password } = req.body;

  const hashedPassword = await bcrypt.hash(f_password, 10);

  await pool.query("INSERT INTO admin(first_name, last_name, email, password) VALUES ($1,$2,$3,$4);", [
    f_first_name,
    f_last_name,
    f_email,
    hashedPassword,
  ]);

  res.sendStatus(200);
});
