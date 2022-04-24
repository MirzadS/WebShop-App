const pool = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../middlewares/roles_list");
const catchAsync = require("../utils/catchAsync");
const path = require("path");
const multer = require("multer");
const formatMessage = require("../utils/messages");

// SLANJE MAIL-a
const nodemailer = require("nodemailer");

//PERFORMANSE
const { performance } = require("perf_hooks");

var io = null;

/**
 * MULTER - diskStorage
 */

exports.storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: (req, file, cb) => {
    const photoName = Date.now() + path.extname(file.originalname);
    cb(null, photoName);
  },
});

/**
 * GET
 * TRGOVAC
 */

exports.articleList = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1) FROM article a WHERE a.seller_id  = $1 AND a.archived = false;`,
    [seller_id]
  );

  const profile_pic = await pool.query(`SELECT s.profile_picture FROM seller s WHERE s.seller_id  = $1;`, [seller_id]);

  res.render("seller/articleList", { items: items.rows, profile_pic: profile_pic.rows[0] });
});

/**
 * POST
 * TRGOVAC
 */

exports.articleListPOST = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;
  const { searchString } = req.body;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1) 
     FROM article a 
     WHERE a.seller_id = $1 AND a.archived = false 
            AND (a.article_name ILIKE '%' || $2 || '%'  
                OR a.s_description ILIKE '%' || $2 || '%'
                OR a.keywords ILIKE '%' || $2 || '%');`,
    [seller_id, searchString]
  );

  if (items.rows.length === 0) {
    return res.sendStatus(400);
  }

  res.status(200).json({ articles: items.rows });
});

/**
 * POST
 * TRGOVAC / FILTRIRANJE
 */

exports.articleListFilteringPOST = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;
  const { filteringValue } = req.body;

  var items;
  switch (filteringValue) {
    case "1":
      // LISTA SVIH ARTIKALA

      items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1)
         FROM article a
             WHERE a.seller_id = $1 AND a.archived = false;`,
        [seller_id]
      );

      return res.status(200).json({ articles: items.rows });
    case "2":
      // LISTA NAJPRODAVANIJIH

      items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1)
         FROM article a
             WHERE a.seller_id = $1 AND a.archived = false
         ORDER BY a.total_sold DESC
         LIMIT 2;`,
        [seller_id]
      );

      return res.status(200).json({ articles: items.rows });
    case "3":
      // LISTA NAJMANJE PRODATIH

      items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1)
         FROM article a
             WHERE a.seller_id = $1 AND a.archived = false
         ORDER BY a.total_sold
         LIMIT 2;`,
        [seller_id]
      );

      return res.status(200).json({ articles: items.rows });
    default:
      return res.status(400).send("DEFAULTNO POSTAVITI");
  }
});

/**
 * GET
 * TRGOVAC / NOVI-ARTIKAL
 */

exports.newArticle = catchAsync(async (req, res, next) => {
  const categories = await pool.query("SELECT c.* FROM category c WHERE c.active = true ORDER BY c.category_id;");

  res.render("seller/newArticle", { title: "Novi artikal", categories: categories.rows });
});

/**
 * GET
 * TRGOVAC / ARTIKAL / :ARTIKAL_ID
 */

exports.articleOverview = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;

  // USLOV DA LI TAJ TRGOVAC MOZE PRISTUPITI TOM ARTIKLU npr. /TRGOVAC/ARTIKAL/16
  const seller_id = req.tokenInfo.t_user_id;

  const is_allowed = await pool.query(
    `SELECT *
     FROM article
     WHERE seller_id = $1 AND article_id = $2;`,
    [seller_id, artikal_id]
  );

  if (is_allowed.rows.length === 0) {
    //return res.send("Ne mozes pristupiti ovom artiklu");
    //return res.redirect("..");
    return res.redirect("/trgovac");
  }

  const article_data_p = pool.query(
    `SELECT a.*, s.store_name, s.city, s.address FROM article a 
          INNER JOIN seller s ON s.seller_id = a.seller_id
    WHERE a.article_id = $1;`,
    [artikal_id]
  );

  const images_data_p = pool.query(
    `SELECT image_path FROM image i 
     WHERE i.article_id = $1;`,
    [artikal_id]
  );

  const categories_data_p = pool.query(
    `SELECT c.category_name 
     FROM article_category ac 
          INNER JOIN category c ON c.category_id = ac.category_id 
     WHERE ac.article_id = $1;`,
    [artikal_id]
  );

  let [article_data, images_data, categories_data] = await Promise.all([
    article_data_p,
    images_data_p,
    categories_data_p,
  ]);

  const data = {
    ARTICLE_DATA: article_data.rows,
    IMAGES_DATA: images_data.rows,
    CATEGORIES_DATA: categories_data.rows,
  };

  res.render("seller/articleOverview", { data: data });
});

/**
 * PATCH
 * ARTIKAL / BRISANJE
 */

exports.articleDeletePost = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.body;

  await pool.query(`UPDATE article SET archived = true WHERE article_id = $1`, [artikal_id]);
  res.status(200).send(`Artikal je uspješno izbrisan.`);
});

/**
 * GET
 * TRGOVAC / AZURIRANJE-ARTIKLA / :ARTIKAL_ID
 */

exports.articleUpdate = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;

  const seller_id = req.tokenInfo.t_user_id;

  const is_allowed = await pool.query(
    `SELECT *
     FROM article
     WHERE seller_id = $1 AND article_id = $2;`,
    [seller_id, artikal_id]
  );

  if (is_allowed.rows.length === 0) {
    return res.redirect("/trgovac");
  }

  const article_data_p = pool.query(
    `SELECT a.*, s.store_name, s.city, s.address FROM article a 
          INNER JOIN seller s ON s.seller_id = a.seller_id
    WHERE a.article_id = $1;`,
    [artikal_id]
  );

  const images_data_p = pool.query(
    `SELECT image_id,image_path FROM image i 
     WHERE i.article_id = $1 AND i.archived = $2;`,
    [artikal_id, false]
  );

  const categories_data_p = pool.query(
    `SELECT cat.category_id, cat.category_name
     FROM category cat
     WHERE cat.category_name
       NOT IN (SELECT c.category_name
               FROM category c
                   INNER JOIN article_category ac ON ac.category_id = c.category_id
               WHERE ac.article_id = $1)`,
    [artikal_id]
  );

  const keywords_data_p = pool.query(
    `SELECT * FROM article_keywords ak 
     WHERE ak.article_id = $1;`,
    [artikal_id]
  );

  let [article_data, images_data, categories_data, keywords_data] = await Promise.all([
    article_data_p,
    images_data_p,
    categories_data_p,
    keywords_data_p,
  ]);

  const data = {
    ARTICLE_DATA: article_data.rows,
    IMAGES_DATA: images_data.rows,
    CATEGORIES_DATA: categories_data.rows,
    KEYWORDS_DATA: keywords_data.rows,
    ARTICLE_ID: artikal_id,
  };

  res.render("seller/articleUpdate", { data: data });
});

/**
 * POST
 * TRGOVAC / AZURIRANJE-ARTIKLA / : ARTIKAL_ID
 */

exports.newArticlePhotoPOST = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;

  for (const photoName of req.files) {
    await pool.query("INSERT INTO image (article_id, image_path) VALUES ($1,$2)", [artikal_id, photoName.filename]);
  }

  console.log("ISPIS ARTIKLA ID: " + artikal_id);

  return res.redirect("/trgovac/azuriranje-artikla/" + artikal_id);
});

/**
 * POST
 * TRGOVAC / AZURIRANJE-ARTIKLA
 */

exports.articleUpdatePOST = catchAsync(async (req, res, next) => {
  const { inputID, inputValue, artikal_id } = req.body;

  if (inputID == "f_category") {
    const categories = JSON.parse(inputValue);

    let categories_array = Array.isArray(categories) ? categories : categories.trim().split(",");
    categories_array = categories_array.map((x) => parseInt(x));

    for (const category_id of categories_array) {
      await pool.query("INSERT INTO article_category (article_id, category_id) VALUES ($1,$2)", [
        artikal_id,
        category_id,
      ]);
    }

    return res.status(200).send("Uspješno dodate nove kategorije artikla.");
  }

  if (inputID.includes("keyword")) {
    const keywordID = parseInt(inputID.trim().split("_")[1]);

    await pool.query("UPDATE article_keywords SET keyword = $1 WHERE article_keywords_id = $2", [
      inputValue,
      keywordID,
    ]);

    return res.status(200).send("Uspješan update ključne riječi.");
  }

  if (inputID == "article_condition") {
    const condition = ["novo", "polovno", "oštečeno"];

    await pool.query("UPDATE article SET article_condition = $1 WHERE article_id = $2", [
      condition[parseInt(inputValue) - 1],
      artikal_id,
    ]);

    return res.status(200).send("Uspješno promijenjeno stanje artikla.");
  }

  if (inputID === "archived") {
    await pool.query("UPDATE image SET archived = $1 WHERE image_id = $2", [true, inputValue]);

    return res.status(200).send("Uspješno arhivirala fotografija artikla.");
  }

  return res.send(`Uspješno izvrsen update - ${inputID}`);
});

/**
 * GET
 * TRGOVAC / PROFIL
 */

exports.sellerProfile = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;

  const seller_data = await pool.query(`SELECT * FROM seller s WHERE s.seller_id = $1`, [seller_id]);
  res.render("seller/sellerProfile", {
    data: seller_data.rows[0],
  });
});

/**
 * POST
 * TRGOVAC / PROFIL
 */

exports.sellerProfilePOST = catchAsync(async (req, res, next) => {
  const { fieldName, fieldValue } = req.body;
  const seller_id = req.tokenInfo.t_user_id;

  console.log("FieldName: ", fieldName);
  console.log("FieldValue: ", fieldValue);

  if (fieldName === "password") {
    const hashedPassword = await bcrypt.hash(fieldValue, 10);

    await pool.query(
      `UPDATE seller
        SET password = $1
     WHERE seller_id = $2`,
      [hashedPassword, seller_id]
    );
  } else {
    await pool.query(`UPDATE seller SET ${fieldName} = $1 WHERE seller_id = $2`, [fieldValue, seller_id]);
  }

  return res.status(200).json({
    msg: "Uspješno ažurirano",
    fieldName: fieldName,
    fieldValue: fieldValue,
  });
});

/**
 * POST
 * TRGOVAC / PROFIL / SLIKA
 */

exports.sellerProfileImagePOST = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;

  await pool.query("UPDATE seller SET profile_picture = $1 WHERE seller_id = $2", [req.file.filename, seller_id]);

  res.redirect("/trgovac/profil");
});

/**
 * POST
 * TRGOVAC / NOVI-ARTIKAL
 */

exports.newArticlePOST = catchAsync(async (req, res, next) => {
  const { f_article_name, f_price, f_quantity, f_s_description, f_l_description, f_category, f_keywords } = req.body;

  const user_id = req.tokenInfo.t_user_id;
  const words = f_keywords.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n]+/);

  const currArticleID = await pool.query(
    "INSERT INTO article (seller_id,article_name, s_description, l_description, price, quantity) VALUES ($1,$2,$3,$4,$5,$6) RETURNING article_id",
    [user_id, f_article_name, f_s_description, f_l_description, f_price, f_quantity]
  );

  for (const keyword of words) {
    await pool.query("INSERT INTO article_keywords (keyword, article_id) VALUES ($1,$2)", [
      keyword,
      currArticleID.rows[0].article_id,
    ]);
  }

  // const f_article_category = Array.isArray(f_category) ? f_category : Array.from(f_category.trim());

  const f_article_category = Array.isArray(f_category) ? f_category : f_category.trim().split(" ");

  for (const category_id of f_article_category) {
    await pool.query("INSERT INTO article_category (article_id, category_id) VALUES ($1,$2)", [
      currArticleID.rows[0].article_id,
      parseInt(category_id),
    ]);
  }

  for (const photoName of req.files) {
    await pool.query("INSERT INTO image (article_id, image_path) VALUES ($1,$2)", [
      currArticleID.rows[0].article_id,
      photoName.filename,
    ]);
  }

  res.status(200).redirect("/trgovac");
});

/**
 * GET
 * TRGOVAC / NARUDZBE
 */

exports.sellerOrderInfo = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;

  const orderInfo = await pool.query(
    `SELECT o.order_id,CONCAT(c.first_name, ' ', c.last_name) AS name, c.email, ci.quantity, a.article_name, a.article_id, o.total, CONCAT(o.order_status,',',enum_range(NULL::mood3))
     FROM "order" o
        INNER JOIN cart_item ci ON ci.cart_item_id = o.cart_item_id
        INNER JOIN article a ON a.article_id = ci.article_id
        INNER JOIN customer c ON c.customer_id = ci.customer_id
     WHERE a.seller_id = $1
     ORDER BY o.created_at`,
    [seller_id]
  );

  var order_status_UQ = [];
  orderInfo.rows.forEach((el) => {
    const test = el.concat.replace(/[{(")}]/g, "").split(",");

    if (test[0] === "poslano") {
      order_status_UQ.push([test[0]]);
    } else if (test[0] === "odbijeno") {
      order_status_UQ.push([test[0]]);
    } else {
      order_status_UQ.push([...new Set(test)]);
    }
  });

  res.render("seller/sellerOrderInfo", { orders: orderInfo.rows, status: order_status_UQ });
});

/**
 * PATCH
 * TRGOVAC / NARUDZBE
 * 1)
 */

exports.sellerOrderInfoPATCH = catchAsync(async (req, res, next) => {
  const { t_order_id, t_order_status, t_article_id, t_quantity } = req.body;

  switch (t_order_status) {
    case "poslano":
      const approval = await pool.query(`SELECT approval($1, $2, $3, $4)`, [
        t_order_status,
        t_order_id,
        t_article_id,
        t_quantity,
      ]);

      if (approval.rows[0].approval === -1) {
        req.msg = {
          message: "Uspjesan update narudzbe.",
          updated_status: "poslano",
        };
        return next();
      } else {
        return res.status(400).send("Nemate traženu količinu artikla da biste odobrili narudžbu.");
      }
    case "odbijeno":
      await pool.query(`UPDATE "order" SET order_status = $1 WHERE order_id = $2`, [
        t_order_status,
        parseInt(t_order_id),
      ]);

      req.msg = {
        message: "Uspjesan update narudzbe.",
        updated_status: "odbijeno",
      };
      return next();
    case "na čekanju":
      return res.status(400).send("Status narudžbe je već na čekanju.");
    default:
      return res.status(400).send("Nepostojeći status narudžbe.");
  }
});

/**
 * POST
 * TRGOVAC / NARUDZBE
 * 2)
 */

exports.sendingEmail = catchAsync(async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "web_shop_2022@hotmail.com",
      pass: "web_shop_2021_22",
    },
  });

  const options = {
    from: "web_shop_2022@hotmail.com",
    to: "mirzad.smoloo@gmail.com",
    subject: "Narudžba - Web Shop",
    text: "Vaša narudžba je ....!",
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
  });

  return res.json(req.msg);
});

/**
 * GET
 * TRGOVAC / STATISTIKA
 */

exports.sellerStatistics = catchAsync(async (req, res, next) => {
  const seller_id = req.tokenInfo.t_user_id;

  const total_earnings = await pool.query(
    `SELECT SUM(a.price*a.total_sold) AS t_e FROM article a WHERE a.seller_id = $1`,
    [seller_id]
  );

  console.log(total_earnings.rows[0]);

  const articles = await pool.query(
    `SELECT a.article_id, a.article_name, a.price, a.total_sold, a.price*a.total_sold AS total 
     FROM article a WHERE a.seller_id = $1
     ORDER BY total DESC`,
    [seller_id]
  );

  res.render("seller/sellerStatistics", { articles: articles.rows, total_earnings: total_earnings.rows[0].t_e });
});

/**
 * GET
 * TRGOVAC / CHAT
 */

exports.chatList = catchAsync(async (req, res, next) => {
  const { t_user_id, t_role_id } = req.tokenInfo;

  const personal_info = {
    personal_info: t_user_id + "_" + t_role_id,
  };

  const chatList = await pool.query(
    `SELECT DISTINCT c.room, (CASE
            WHEN c.sender_id = $1 AND  c.sender_role = $2 AND c.receiver_role = $3 THEN 'Admin'
            WHEN c.receiver_id = $1 AND  c.receiver_role = $2 AND c.sender_role = $3 THEN 'Admin'
            WHEN c.sender_id = $1 AND  c.sender_role = $2 THEN (SELECT CONCAT(cust.first_name, ' ', cust.last_name) FROM customer cust WHERE cust.customer_id = c.receiver_id)
            WHEN c.receiver_id = $1 AND  c.receiver_role = $2 THEN (SELECT CONCAT(cust.first_name, ' ', cust.last_name) FROM customer cust WHERE cust.customer_id = c.sender_id)
            ELSE '...'
        END
    ) AS full_name
    FROM chat c
    WHERE (c.sender_id = $1 AND  c.sender_role = $2) OR (c.receiver_id = $1 AND c.receiver_role = $2);`,
    [t_user_id, t_role_id, ROLES_LIST.ADMIN]
  );

  const customer_list = await pool.query(
    `SELECT CONCAT(c.first_name, ' ', c.last_name) AS full_name, CONCAT(c.customer_id,'_',c.role_id,'_','${personal_info.personal_info}') AS ROOM FROM customer c`
  );

  res.render("seller/sellerChatList", {
    chatList: chatList.rows,
    personal_info: personal_info.personal_info,
    customer_list: customer_list.rows,
  });
});

/**
 * GET
 * TRGOVAC / CHAT / :ROOM
 */

exports.chat = catchAsync(async (req, res, next) => {
  const { room } = req.params;

  const room_split = room.split("_");

  if (room_split.length != 4 || room_split.some(isNaN)) {
    return res.status(400).send("Neispravan kod sobe.");
  }

  if (!io) {
    io = require("socket.io")(req.connection.server);

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chat_room, ULOGA }) => {
        console.log("TREBAAA SPASITI ZA : ", ULOGA);
        console.log("SELLER CONTROLLER");

        socket.join(chat_room);
        const chat_room_split = chat_room.split("_");

        if (ULOGA === "trgovac") {
          console.log("NASTIMATI SVE ZA TRGOVCA");
        } else if (ULOGA === "kupac") {
          console.log("NASTIMATI SVE ZA KUPCA");
        }

        const seller_name = await pool.query(`SELECT store_name AS full_name FROM seller WHERE seller_id = $1`, [
          chat_room_split[2],
        ]);

        if (seller_name.rows.length === 0) {
          return;
        }

        const person = await pool.query(`SELECT full_name FROM chatUserList2 WHERE user_id = $1 AND role_id = $2`, [
          chat_room_split[0],
          chat_room_split[1],
        ]);

        const previous_messages = await pool.query(
          `SELECT c.sender_id,  cul.full_name, c.message, c.created_at
          FROM chat c
                    INNER JOIN chatUserList2 cul ON cul.user_id = c.sender_id AND cul.role_id = c.sender_role
          WHERE c.room = $1
          ORDER BY c.chat_id;`,
          [chat_room]
        );

        io.to(chat_room).emit("displayInfo", {
          room: chat_room,
          full_name: seller_name.rows[0].full_name,
          previous_messages: previous_messages.rows,
          person_fn: person.rows[0].full_name,
        });
      });

      socket.on("chatMessage", async ({ chat_full_name, msg, chat_room }) => {
        const chat_room_split = chat_room.split("_");

        const user_message = formatMessage(chat_full_name, msg);

        pool.query(
          `INSERT INTO chat
                (sender_id, sender_role, receiver_id, receiver_role, message, room, created_at)
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            chat_room_split[2],
            chat_room_split[3],
            chat_room_split[0],
            chat_room_split[1],
            msg,
            chat_room,
            user_message.time,
          ]
        );

        io.to(chat_room).emit("message", user_message);
      });
    });
  }

  res.render("index/sellerChat");
});
