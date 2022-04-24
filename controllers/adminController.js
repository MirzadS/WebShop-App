const pool = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../middlewares/roles_list");
const catchAsync = require("../utils/catchAsync");

var io = null;

/**
 * GET
 * ADMIN
 */

exports.dashboard = catchAsync(async (req, res, next) => {
  const sellers = await pool.query(
    `SELECT s.seller_id, s.store_name, CONCAT(s.first_name, ' ', s.last_name) AS owner, TO_CHAR(s.blocked :: DATE, 'yyyy-mm-dd') as blocked
     FROM seller s;`
  );

  const customers = await pool.query(
    `SELECT c.customer_id ,CONCAT(c.first_name, ' ', c.last_name) AS full_name, TO_CHAR(c.blocked :: DATE, 'yyyy-mm-dd') as blocked
     FROM customer c;`
  );

  const categories = await pool.query(
    `SELECT c.category_id ,c.category_name
     FROM category c
     WHERE c.active = true;`
  );

  res.render("admin/admin__Dashboard", {
    sellers: sellers.rows,
    customers: customers.rows,
    categories: categories.rows,
  });
});

/**
 * PATCH
 * ADMIN / BLOKIRANJE
 */

exports.blocking = catchAsync(async (req, res, next) => {
  const { user_id, user_role, blocked_until } = req.body;

  switch (user_role) {
    case "seller":
      await pool.query(`UPDATE seller SET blocked = $1 WHERE seller_id = $2`, [blocked_until, parseInt(user_id)]);
      return res.status(200).send("Trgovac je blokiran.");
    case "customer":
      await pool.query(`UPDATE customer SET blocked = $1 WHERE customer_id = $2`, [blocked_until, parseInt(user_id)]);
      return res.status(200).send("Kupac je blokiran.");
    default:
      return res.status(400).send("Greška prilikom blokiranja");
  }
});

/**
 * PATCH
 * ADMIN / ARHIVIRANJE
 */

exports.archiving = catchAsync(async (req, res, next) => {
  const { user_id, user_role } = req.body;

  switch (user_role) {
    case "seller":
      await pool.query(`UPDATE seller SET archived = true WHERE seller_id = $1`, [parseInt(user_id)]);
      return res.status(200).send("Trgovac je arhiviran.");
    case "customer":
      await pool.query(`UPDATE customer SET archived = true WHERE customer_id = $1`, [parseInt(user_id)]);
      return res.status(200).send("Kupac je arhiviran.");
    default:
      return res.status(400).send("Greška prilikom arhiviranja");
  }
});

/**
 * PATCH
 * ADMIN / UKLONI-OGRANICENJA
 */

exports.removeRestrictions = catchAsync(async (req, res, next) => {
  const { user_id, user_role } = req.body;

  switch (user_role) {
    case "seller":
      await pool.query(`UPDATE seller SET archived = false, blocked = NULL WHERE seller_id = $1`, [parseInt(user_id)]);
      return res.status(200).send("Uklonjena ograničenja trgovca.");
    case "customer":
      await pool.query(`UPDATE customer SET archived = true, blocked = NULL WHERE customer_id = $1`, [
        parseInt(user_id),
      ]);
      return res.status(200).send("Uklonjena ograničenja kupca.");
    default:
      return res.status(400).send("Greška prilikom arhiviranja");
  }
});

/**
 * PATCH
 * ADMIN / KATEGORIJE
 */

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { category_id, new_category_name } = req.body;

  await pool.query(`UPDATE category SET category_name = $1 WHERE category_id = $2`, [new_category_name, category_id]);

  res.send("Uspješno ažurirana kategorija");
});

/**
 * DELETE
 * ADMIN / KATEGORIJE
 */

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { category_id } = req.body;

  await pool.query(`UPDATE category SET active=false WHERE category_id = $1`, [category_id]);

  res.status(200).send("Uspješno izbrisana kategorija");
});
/**
 * POST
 * ADMIN / KATEGORIJE
 */

exports.addCategory = catchAsync(async (req, res, next) => {
  const { new_category } = req.body;

  const new_category_row = await pool.query(`INSERT INTO category(category_name) VALUES ($1) RETURNING *`, [
    new_category,
  ]);

  res.status(200).send({ new_category_row: new_category_row.rows });
});

/**
 * GET
 * ADMIN / CHAT
 */

exports.chatList = catchAsync(async (req, res, next) => {
  const { t_user_id, t_role_id } = req.tokenInfo;

  const chatList = await pool.query(
    `SELECT DISTINCT c.room, (CASE
              WHEN c.sender_id = $1 AND  c.sender_role = $2 AND c.receiver_role = $3 THEN (SELECT CONCAT(cus.first_name, ' ',cus.last_name) FROM customer cus WHERE cus.customer_id = c.receiver_id)
              WHEN c.receiver_id = $1 AND  c.receiver_role = $2 AND c.sender_role = $3 THEN (SELECT CONCAT(cus.first_name, ' ',cus.last_name) FROM customer cus WHERE cus.customer_id = c.sender_id)
              WHEN c.sender_id = $1 AND  c.sender_role = $2 THEN (SELECT sel.store_name FROM seller sel WHERE sel.seller_id = c.receiver_id)
              WHEN c.receiver_id = $1 AND  c.receiver_role = $2 THEN (SELECT sel.store_name FROM seller sel WHERE sel.seller_id = c.sender_id)
              ELSE '...'
          END
      ) AS full_name
      FROM chat c
      WHERE (c.sender_id = $1 AND  c.sender_role = $2) OR (c.receiver_id = $1 AND c.receiver_role = $2);`,
    [1, 1, ROLES_LIST.CUSTOMER]
  );

  const customer_list = await pool.query(
    `SELECT CONCAT(c.first_name, ' ', c.last_name) AS full_name, CONCAT(c.customer_id,'_',c.role_id,'_','1_1') AS ROOM FROM customer c`
  );

  const seller_list = await pool.query(
    `SELECT s.store_name, CONCAT('1_1','_', s.seller_id,'_',s.role_id) AS ROOM FROM seller s`
  );

  res.render("admin/admin__ChatList", {
    chatList: chatList.rows,
    customer_list: customer_list.rows,
    seller_list: seller_list.rows,
  });
});

/**
 * GET
 * ADMIN / STATISTIKA
 */

exports.statistics = catchAsync(async (req, res, next) => {
  const users = await pool.query(
    `SELECT role_id, COUNT(*) AS user_count
      FROM allUsers
      GROUP BY role_id
      ORDER BY role_id;`
  );

  const store_info = await pool.query(
    `SELECT s.store_name, CONCAT(s.first_name, ' ', s.last_name) AS owner, SUM(a.price*a.total_sold) AS earnings, SUM(a.total_sold) AS order_count,COUNT(*) AS article_count
     FROM article a
        INNER JOIN seller s ON a.seller_id = s.seller_id
     GROUP BY s.store_name, s.first_name, s.last_name
     ORDER BY article_count;`
  );

  res.render("admin/admin__Statistics", { users: users.rows, stores: store_info.rows });
});
