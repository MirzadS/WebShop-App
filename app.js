require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const checkToken = require("./middlewares/checkToken");
// const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const customerRouter = require("./routes/customer");
const sellerRouter = require("./routes/seller");
const adminRouter = require("./routes/admin");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(expressLayouts);
// app.set("layout", "./layouts/main");

app.use("/kupac", checkToken, customerRouter);
app.use("/trgovac", checkToken, sellerRouter);
app.use("/admin", checkToken, adminRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  /* console.log("Ispis greske: ", err); */
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");

  /* res.json({
    message: `Doslo je do greske: ${err}`,
  }); */
});

module.exports = app;
