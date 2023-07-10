const express = require("express"),
  path = require("path"),
  createError = require("http-errors"),
  cookieParser = require("cookie-parser"),
  logger = require("morgan"),
  cors = require("cors"),
  { Check_API } = require("./configs/App.config"),
  app = express();

// view engine setup
app
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")

  .use(cors())
  .use(logger("dev"))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(express.static(path.join(__dirname, "public")))

  // Routes API
  .use("/", require("./routes/index"))

  /* Configuration */
  .use("/api/v1", require("./routes/Configuration/Auth/User"))

  /*Gestion Stok matière prémière */
  .use("/api/v1", require("./routes/Gestion Stock/Raw materials/Product"))
  .use("/api/v1", require("./routes/Gestion Stock/Raw materials/EntreeStock"))
  // .use('/api/v1', require('./routes/Gestion Stock/Raw materials/SortieStock'))

  // catch 404 and forward to error handler
  .use(function (req, res, next) {
    next(createError(404));
  })

  // error handler
  .use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

(async () => {
  await Check_API();
})();

module.exports = app;
