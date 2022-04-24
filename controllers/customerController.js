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

var io = null;

//PERFORMANSE
const { performance } = require("perf_hooks");

/**
 * GET
 * KUPAC
 */

exports.customerArticleList = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
          (SELECT
              CASE
                WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
              END
          FROM saved_items si
          WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
     FROM article a;`,
    [customer_id]
  );

  const categories = await pool.query(`SELECT * FROM category c WHERE c.active = true;`);

  res.render("customer/customerArticleList", { items: items.rows, categories: categories.rows });
});

/**
 * POST
 * KUPAC
 */

exports.customerArticleListPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { searchString } = req.body;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
          (SELECT
              CASE
                WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
              END
          FROM saved_items si
          WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
     FROM article a
     WHERE a.archived = false 
            AND (a.article_name ILIKE '%' || $2 || '%'  
                OR a.s_description ILIKE '%' || $2 || '%'
                OR a.keywords ILIKE '%' || $2 || '%');`,
    [customer_id, searchString]
  );

  if (items.rows.length === 0) {
    return res.sendStatus(400);
  }

  res.status(200).json({ articles: items.rows });
});

/**
 * POST
 * KUPAC / FILTRIRANJE
 */

exports.articleListFilteringPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { filteringValue } = req.body;

  if (parseInt(filteringValue) == 0) {
    var items = await pool.query(
      `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
            (SELECT
                CASE
                  WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
                END
            FROM saved_items si
            WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
       FROM article a
       WHERE a.archived = false;`,
      [customer_id]
    );

    return res.status(200).json({ articles: items.rows });
  }

  var items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
          (SELECT
              CASE
                WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
              END
          FROM saved_items si
          WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
     FROM article a
     WHERE a.archived = false AND a.article_id IN (SELECT ac.article_id FROM article_category ac WHERE ac.category_id = $2);`,
    [customer_id, parseInt(filteringValue)]
  );

  return res.status(200).json({ articles: items.rows });
});

/**
 * POST
 * KUPAC / SORTIRANJE
 */

exports.articleListSortingPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { sortingValue } = req.body;

  switch (parseInt(sortingValue)) {
    case 1:
      var items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
              (SELECT
                  CASE
                    WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
                  END
              FROM saved_items si
              WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
         FROM article a
         WHERE a.archived = false
         ORDER BY a.created_at DESC;`,
        [customer_id]
      );

      return res.status(200).json({ articles: items.rows });

    case 2:
      var items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
                (SELECT
                    CASE
                      WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
                    END
                FROM saved_items si
                WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
           FROM article a
           WHERE a.archived = false
           ORDER BY a.created_at;`,
        [customer_id]
      );
      return res.status(200).json({ articles: items.rows });
    case 3:
      var items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
                (SELECT
                    CASE
                      WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
                    END
                FROM saved_items si
                WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
           FROM article a
           WHERE a.archived = false
           ORDER BY a.price;`,
        [customer_id]
      );
      return res.status(200).json({ articles: items.rows });
    case 4:
      var items = await pool.query(
        `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
                (SELECT
                    CASE
                      WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
                    END
                FROM saved_items si
                WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
           FROM article a
           WHERE a.archived = false
           ORDER BY a.price DESC;`,
        [customer_id]
      );
      return res.status(200).json({ articles: items.rows });
    default:
      return res.status(400).json("Greška");
  }
});

/**
 * POST
 * KUPAC / TRGOVAC / PROFIL
 */

exports.sellerProfileArticleListPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { searchString, trgovac_id } = req.body;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
          (SELECT
              CASE
                WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
              END
          FROM saved_items si
          WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
     FROM article a
     WHERE a.archived = false AND a.seller_id = $3
            AND (a.article_name ILIKE '%' || $2 || '%'  
                OR a.s_description ILIKE '%' || $2 || '%'
                OR a.keywords ILIKE '%' || $2 || '%');`,
    [customer_id, searchString, trgovac_id]
  );

  if (items.rows.length === 0) {
    return res.sendStatus(400);
  }

  res.status(200).json({ articles: items.rows });
});

/**
 * POST
 * KUPAC / SPASENI-ARTIKLI
 */

exports.savedItemsPOST = catchAsync(async (req, res, next) => {
  const { article_id, contains } = req.body;
  const customer_id = req.tokenInfo.t_user_id;

  if (contains === "true") {
    await pool.query("INSERT INTO saved_items (article_id, customer_id) VALUES ($1,$2)", [article_id, customer_id]);

    return res.status(200).send("Artikal je sačuvan u listu.");
  } else {
    await pool.query("DELETE FROM saved_items si WHERE si.article_id = $1 AND si.customer_id = $2 ", [
      article_id,
      customer_id,
    ]);

    return res.status(200).send("Artikal je uklonjen sa liste sačuvanih artikala");
  }
});
/**
 * GET
 * KUPAC / CHAT
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
            WHEN c.sender_id = $1 AND  c.sender_role = $2 THEN (SELECT sel.store_name FROM seller sel WHERE sel.seller_id = c.receiver_id)
            WHEN c.receiver_id = $1 AND  c.receiver_role = $2 THEN (SELECT sel.store_name FROM seller sel WHERE sel.seller_id = c.sender_id)
            ELSE '...'
        END
    ) AS full_name
    FROM chat c
    WHERE (c.sender_id = $1 AND  c.sender_role = $2) OR (c.receiver_id = $1 AND c.receiver_role = $2);`,
    [t_user_id, t_role_id, ROLES_LIST.ADMIN]
  );

  const seller_list = await pool.query(
    `SELECT s.store_name, CONCAT('${personal_info.personal_info}','_', s.seller_id,'_',s.role_id) AS ROOM FROM seller s`
  );

  res.render("customer/customerChatList", {
    chatList: chatList.rows,
    personal_info: personal_info.personal_info,
    seller_list: seller_list.rows,
  });
});

/**
 * GET
 * KUPAC / CHAT / :ROOM
 */

exports.chat = catchAsync(async (req, res, next) => {
  const { t_user_id, t_role_id } = req.tokenInfo;
  const { room } = req.params;

  const room_split = room.split("_");

  if (room_split.length != 4 || room_split.some(isNaN)) {
    return res.status(400).send("Neispravan kod sobe.");
  }

  if (t_role_id === 2) {
    if (parseInt(room_split[2]) !== t_user_id || parseInt(room_split[3]) !== t_role_id) {
      return res.status(400).send("Nemate pristup ovom chat-u.");
    }
  }

  if (!io) {
    io = require("socket.io")(req.connection.server);

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chat_room, ULOGA }) => {
        socket.join(chat_room);
        const chat_room_split = chat_room.split("_");

        if (ULOGA === "trgovac") {
          var person = await pool.query(`SELECT full_name FROM chatUserList2 WHERE user_id = $1 AND role_id = $2`, [
            chat_room_split[0],
            chat_room_split[1],
          ]);
        } else if (ULOGA === "kupac") {
          var person = await pool.query(`SELECT full_name FROM chatUserList2 WHERE user_id = $1 AND role_id = $2`, [
            chat_room_split[2],
            chat_room_split[3],
          ]);
        } else if (ULOGA === "admin") {
          console.log(chat_room_split);
          if (chat_room_split[0] === "1" && chat_room_split[1] === "1") {
            var person = await pool.query(`SELECT full_name FROM chatUserList2 WHERE user_id = $1 AND role_id = $2`, [
              chat_room_split[2],
              chat_room_split[3],
            ]);
          } else {
            var person = await pool.query(`SELECT full_name FROM chatUserList2 WHERE user_id = $1 AND role_id = $2`, [
              chat_room_split[0],
              chat_room_split[1],
            ]);
          }
        }

        const previous_messages = await pool.query(
          `SELECT c.sender_id,  cul.full_name, c.message, c.created_at
        FROM chat c
                  INNER JOIN chatUserList2 cul ON cul.user_id = c.sender_id AND cul.role_id = c.sender_role
        WHERE c.room = $1
        ORDER BY c.chat_id;`,
          [chat_room]
        );

        //Room info
        io.to(chat_room).emit("displayInfo", {
          room: chat_room,

          previous_messages: previous_messages.rows,
          person_fn: person.rows[0].full_name,
          ulogaServer: ULOGA,
        });
      });

      var username = null;
      var user_message;

      socket.on("chatMessage", async ({ msg, chat_room, ULOGA }) => {
        const chat_room_split = chat_room.split("_");

        if (ULOGA === "trgovac") {
          if (username == null) {
            const seller_name = await pool.query(`SELECT store_name AS full_name FROM seller WHERE seller_id = $1`, [
              chat_room_split[2],
            ]);

            username = seller_name.rows[0].full_name;
            user_message = formatMessage(username, msg);
          } else {
            user_message = formatMessage(username, msg);
          }

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
        } else if (ULOGA === "kupac") {
          if (username == null) {
            const customer_name = await pool.query(
              `SELECT CONCAT(first_name, ' ', last_name ) AS full_name FROM customer WHERE customer_id = $1`,
              [chat_room_split[0]]
            );

            username = customer_name.rows[0].full_name;
            user_message = formatMessage(username, msg);
          } else {
            user_message = formatMessage(username, msg);
          }

          pool.query(
            `INSERT INTO chat
                (sender_id, sender_role, receiver_id, receiver_role, message, room, created_at)
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              chat_room_split[0],
              chat_room_split[1],
              chat_room_split[2],
              chat_room_split[3],
              msg,
              chat_room,
              user_message.time,
            ]
          );
        } else if (ULOGA === "admin") {
          if (username == null) {
            username = "Admin";
            user_message = formatMessage(username, msg);
          } else {
            user_message = formatMessage(username, msg);
          }

          if (chat_room_split[0] === "1" && chat_room_split[1] === "1") {
            pool.query(
              `INSERT INTO chat
                  (sender_id, sender_role, receiver_id, receiver_role, message, room, created_at)
                  VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [
                chat_room_split[0],
                chat_room_split[1],
                chat_room_split[2],
                chat_room_split[3],
                msg,
                chat_room,
                user_message.time,
              ]
            );
          } else {
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
          }
        }

        io.to(chat_room).emit("message", user_message);
      });
    });
  }

  res.render("index/chat");
});

/**
 * GET
 * KUPAC / ARTIKAL / :ARTIKAL_ID
 */

exports.articleOverview = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;
  const { t_user_id, t_role_id } = req.tokenInfo;

  const personal_data = { t_user_id, t_role_id };

  const article_data_p = pool.query(
    `SELECT a.*, s.seller_id, s.role_id, s.store_name, s.city, s.address FROM article a 
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
    PERSONAL_DATA: personal_data,
  };

  res.render("customer/customerArticleOverview", { data: data });
});

/**
 * GET
 * KUPAC / TRGOVAC / PROFIL / :TRGOVAC_ID
 */

exports.sellerProfile = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { trgovac_id } = req.params;

  const store_name = await pool.query(`SELECT s.store_name FROM seller s WHERE seller_id = $1`, [trgovac_id]);

  if (store_name.rows.length === 0) {
    return res.send("Trgovac sa tim ID-em ne postoji.");
  }
  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1),
          (SELECT
              CASE
                WHEN si.customer_id = $1 AND si.article_id = a.article_id THEN TRUE
              END
          FROM saved_items si
          WHERE si.customer_id = $1 AND si.article_id = a.article_id) AS saved
     FROM article a
     WHERE a.seller_id = $2;`,
    [customer_id, trgovac_id]
  );

  res.render("customer/customer__SellerProfile.ejs", { items: items.rows, store_name: store_name.rows });
});

/**
 * GET
 * KUPAC / TRGOVAC / :TRGOVAC_ID / OCJENA
 */

exports.sellerFeedback = catchAsync(async (req, res, next) => {
  const { trgovac_id } = req.params;
  const customer_id = req.tokenInfo.t_user_id;
  var update = false;

  const exist = await pool.query(`SELECT s.seller_id FROM seller s WHERE s.seller_id = $1`, [trgovac_id]);

  if (exist.rows.length === 0) {
    return res.send("Trgovac pod tim ID-em ne postoji.");
  }

  const commented = await pool.query(
    `SELECT sf.rating, sf.comment 
     FROM seller_feedback sf
     WHERE sf.customer_id = $1 AND sf.seller_id = $2`,
    [customer_id, trgovac_id]
  );

  const reviews = await pool.query(
    `SELECT CONCAT(first_name, ' ', last_name) AS reviewer, sf.rating, sf.comment 
     FROM seller_feedback sf 
          INNER JOIN customer c ON c.customer_id = sf.customer_id
     WHERE sf.seller_id = $1`,
    [trgovac_id]
  );

  if (commented.rows.length > 0) {
    update = true;
  }

  res.render("customer/customer__SellerFeedback", {
    seller_id: trgovac_id,
    reviews: reviews.rows,
    update: update,
  });
});

/**
 * POST
 * KUPAC / TRGOVAC / :TRGOVAC_ID / OCJENA
 */

exports.sellerFeedbackPOST = catchAsync(async (req, res, next) => {
  const { rating, comment, seller_id } = req.body;
  const customer_id = req.tokenInfo.t_user_id;

  await pool.query("INSERT INTO seller_feedback (seller_id, customer_id, rating, comment) VALUES ($1,$2,$3,$4)", [
    seller_id,
    customer_id,
    rating,
    comment,
  ]);

  res.send(`Komentar trgovca uspjesno izvrsen.`);
});

/**
 * GET
 * KUPAC / ARTIKAL / :ARTIKAL_ID / OCJENA
 */

exports.reviewsAndRatings = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;
  const customer_id = req.tokenInfo.t_user_id;
  var update = false;

  const exist = await pool.query(`SELECT a.article_id FROM article a WHERE article_id = $1`, [artikal_id]);

  if (exist.rows.length === 0) {
    return res.send("Artikal pod tim ID-em ne postoji.");
  }

  const commented = await pool.query(
    `SELECT pr.rating, pr.comment 
     FROM product_reviews pr 
     WHERE pr.customer_id = $1 AND pr.product_id = $2`,
    [customer_id, artikal_id]
  );

  const reviews = await pool.query(
    `SELECT CONCAT(first_name, ' ', last_name) AS reviewer, pr.rating, pr.comment 
     FROM product_reviews pr 
          INNER JOIN customer c ON c.customer_id = pr.customer_id
     WHERE product_id = $1`,
    [artikal_id]
  );

  if (commented.rows.length > 0) {
    update = true;
  }

  res.render("customer/customer__ProductReviewsAndRatings", {
    artikal_id: artikal_id,
    reviews: reviews.rows,
    update: update,
  });
});

/**
 * POST
 * KUPAC / ARTIKAL / OCJENA
 */

exports.reviewsAndRatingsPOST = catchAsync(async (req, res, next) => {
  const { rating, comment, product_id } = req.body;
  const customer_id = req.tokenInfo.t_user_id;

  await pool.query("INSERT INTO product_reviews (product_id, customer_id, rating, comment) VALUES ($1,$2,$3,$4)", [
    product_id,
    customer_id,
    rating,
    comment,
  ]);

  res.send(`Komentar artikla uspjesno izvrsen.`);
});

/**
 * GET
 * KUPAC / SPASENI-ARTIKLI
 */

exports.savedItems = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;

  const items = await pool.query(
    `SELECT a.*, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1) FROM saved_items si 
        INNER JOIN article a ON si.article_id = a.article_id
     WHERE si.customer_id = $1`,
    [customer_id]
  );

  res.status(200).render("customer/customer__SavedItems", { items: items.rows });
});

/**
 * GET
 * KUPAC / KORPA
 */

exports.articleCart = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;

  const cart_items_p = pool.query(
    `SELECT ci.cart_item_id, ci.article_id, a.article_name, a.price, ci.quantity, (SELECT image_path FROM image i WHERE i.article_id = a.article_id LIMIT 1)
         FROM cart_item ci 
            INNER JOIN customer c ON c.customer_id = ci.customer_id 
            INNER JOIN article a ON a.article_id = ci.article_id
         WHERE ci.customer_id = $1 AND ci.sent = false
         ORDER BY ci.article_id`,
    [customer_id]
  );

  const count_and_sum_p = pool.query(
    `SELECT COUNT(*), SUM(ci.quantity*a.price) 
         FROM cart_item ci 
            INNER JOIN article a ON a.article_id = ci.article_id 
         WHERE ci.customer_id = $1 AND ci.sent = false;`,
    [customer_id]
  );

  let [cart_items, count_and_sum] = await Promise.all([cart_items_p, count_and_sum_p]);

  res.render("customer/customerCart", { items: cart_items.rows, info: count_and_sum.rows[0] });
});

/**
 * PATCH
 * KUPAC / KORPA
 */

exports.articleCartPATCH = catchAsync(async (req, res, next) => {
  const { cart_article_id, cart_quantity } = req.body;
  const customer_id = req.tokenInfo.t_user_id;

  await pool.query(
    `UPDATE cart_item
        SET quantity = $1
    WHERE cart_item_id = $2`,
    [cart_quantity, cart_article_id]
  );

  const countAndSum = await pool.query(
    `SELECT COUNT(*), SUM(ci.quantity*a.price) 
     FROM cart_item ci 
          INNER JOIN article a ON a.article_id = ci.article_id 
     WHERE ci.customer_id = $1 AND ci.sent = false;`,
    [customer_id]
  );

  res.json({
    info: countAndSum.rows[0],
  });
});

/**
 * POST
 * KUPAC / KORPA / :ARTIKAL_ID
 */

exports.articleCartPOST = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;
  const customer_id = req.tokenInfo.t_user_id;

  /* PROVJERA DA LI SE TAJ ARTIKAL VEC NALAZI U KORPI */
  const exists = await pool.query(
    `SELECT ci.cart_item_id
         FROM cart_item ci
         WHERE ci.customer_id = $1 AND ci.article_id = $2 AND ci.sent = false;`,
    [customer_id, artikal_id]
  );

  if (exists.rows.length) {
    await pool.query(
      `UPDATE cart_item
                SET quantity = quantity + 1
             WHERE cart_item_id = $1`,
      [exists.rows[0].cart_item_id]
    );
  } else {
    await pool.query("INSERT INTO cart_item (customer_id, article_id) VALUES ($1,$2)", [customer_id, artikal_id]);
  }

  res.send(`Artikal je dodat u korpu.`);
});

/**
 * DELETE
 * KUPAC / KORPA / :ARTIKAL_ID
 */

exports.articleCartDELETE = catchAsync(async (req, res, next) => {
  const { artikal_id } = req.params;
  const customer_id = req.tokenInfo.t_user_id;

  await pool.query(`DELETE FROM cart_item WHERE cart_item_id = $1 AND customer_id = $2`, [artikal_id, customer_id]);

  const countAndSum = await pool.query(
    `SELECT COUNT(*), SUM(ci.quantity*a.price) 
     FROM cart_item ci 
          INNER JOIN article a ON a.article_id = ci.article_id 
     WHERE ci.customer_id = $1 AND ci.sent = false;`,
    [customer_id]
  );

  res.json({
    info: countAndSum.rows[0],
  });
});

/**
 * POST
 * KUPAC / KORPA / NARUDZBA
 * 1)
 */

exports.orderMultipleItemsPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;

  const quantityCh = await pool.query(`SELECT quantityCheck($1)`, [customer_id]);

  if (quantityCh.rows[0].quantitycheck === -1) {
    next();
  } else {
    res.status(400).send({
      poruka: "Doslo je do greske",
      artikal: quantityCh.rows[0].quantitycheck,
    });
  }
});

/**
 * POST
 * KUPAC / LISTA / NARUDZBA
 * 1)
 */

exports.orderOneItemPOST = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;
  const { product_id, quantity } = req.body;

  const oneItem = await pool.query(`SELECT orderOneItem($1, $2, $3)`, [customer_id, product_id, quantity]);

  console.log(oneItem.rows[0].orderoneitem);

  if (oneItem.rows[0].orderoneitem !== -1) {
    return res
      .status(400)
      .send("Trgovac ne posjeduje vašu željenu količinu. Molomo vas unesite manju količinu artikala");
  }

  next();
});

/**
 * POST
 * KUPAC / LISTA / NARUDZBA
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
    text: "Vaša narudžba je uspješno poslana!",
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Sent: " + info.response);
  });

  return res.status(200).send("Uspješno poslana narudžba. Trebali biste dobiti email.");
});

/**
 * GET
 * KUPAC / NARUDZBE
 */

exports.customerOrderInfo = catchAsync(async (req, res, next) => {
  const customer_id = req.tokenInfo.t_user_id;

  const orderInfo = await pool.query(
    `SELECT o.order_id, s.store_name, s.email, ci.quantity, a.article_name, a.article_id, o.total, CONCAT(o.order_status,',',enum_range(NULL::mood3))
     FROM "order" o
        INNER JOIN cart_item ci ON ci.cart_item_id = o.cart_item_id
        INNER JOIN article a ON a.article_id = ci.article_id
        INNER JOIN seller s ON  s.seller_id = a.seller_id
        INNER JOIN customer c ON c.customer_id = ci.customer_id
     WHERE c.customer_id = $1`,
    [customer_id]
  );

  var order_status_UQ = [];
  orderInfo.rows.forEach((el) => {
    const test = el.concat.replace(/[{(")}]/g, "").split(",");

    if (test[0] === "poslano") {
      order_status_UQ.push([test[0]]);
    } else if (test[0] === "odbijeno") {
      order_status_UQ.push([test[0]]);
    } else {
      //order_status_UQ.push([...new Set(test)]);
      order_status_UQ.push(["na čekanju", "odbijeno"]);
    }
  });

  res.render("customer/customerOrderInfo", { orders: orderInfo.rows, status: order_status_UQ });
});

/**
 * PATCH
 * KUPAC / NARUDZBE
 */

exports.customerOrderInfoPATCH = catchAsync(async (req, res, next) => {
  const { t_order_id, t_order_status } = req.body;

  switch (t_order_status) {
    case "poslano":
      return res.status(400).send("Ne možete kao kupac poslati narudžbu.");
    case "odbijeno":
      await pool.query(`UPDATE "order" SET order_status = $1 WHERE order_id = $2`, [t_order_status, t_order_id]);
      return res.json({
        message: "Uspjesan update narudzbe.",
        updated_status: "odbijeno",
      });
    case "na čekanju":
      return res.status(400).send("Status narudžbe je već na čekanju.");
    default:
      return res.status(400).send("Nepostojeći status narudžbe.");
  }
});
