const { uploader } = require("../../helpers/uploader");
const database = require("../../config").promise();
const databaseSync = require("../../config");
const createError = require("../../helpers/createError");
const createResponse = require("../../helpers/createResponse");
const httpStatus = require("../../helpers/httpStatusCode");
const {
  addAddressSchema,
  addProofSchema,
} = require("../../helpers/validation-schema");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();

module.exports.readAllCart = async (req, res) => {
  let userId = req.user.id;
  // let userId = req.user.id;

  try {
    const GET_CART_ITEMS = `
    SELECT
    c.id,
    c.user_id,
    c.product_id,
      p.name,
      pc.name as category,
      p.stock,
      p.unit,
    c.amount,
      p.stock-c.amount as remaining_stock,
      p.price,
      p.picture
    FROM cart_items c
    LEFT JOIN products p ON c.product_id = p.id 
      LEFT JOIN categories pc ON p.category = pc.id
    WHERE c.user_id = ${userId};`;

    const [CART_ITEMS] = await database.execute(GET_CART_ITEMS);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Cart data fetched",
      "Cart data fetched successfully!",
      CART_ITEMS,
      CART_ITEMS.length
    );

    res.status(response.status).send(response);
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.readCart = async (req, res) => {
  const userId = req.params.userId || 1;
  const page = req.query.page || 1;
  const offset = (page - 1) * 5;

  try {
    const GET_CART_ITEMS = `
    SELECT
    c.id,
    c.user_id,
    c.product_id,
      p.name,
      pc.name as category,
      p.stock,
    c.amount,
      p.stock-c.amount as remaining_stock,
      p.price,
      p.picture
    FROM cart_items c
    LEFT JOIN products p ON c.product_id = p.id 
      LEFT JOIN categories pc ON p.category = pc.id
    WHERE c.user_id = ${userId} LIMIT ${offset}, 5;`;

    const [CART_ITEMS] = await database.execute(GET_CART_ITEMS);

    if (!CART_ITEMS.length) {
      // create response
      const response = new createResponse(
        httpStatus.OK,
        "There isn't any items in the cart yet",
        "Cart item is not found.",
        CART_ITEMS,
        CART_ITEMS.length
      );

      res.status(response.status).send(response);
    } else {
      const GET_CART_ITEMS_TOTAL = `SELECT * FROM cart_items 
      WHERE user_id = ${userId};`;
      const [TOTAL_CART_ITEMS] = await database.execute(GET_CART_ITEMS_TOTAL);

      let total;
      if (TOTAL_CART_ITEMS <= CART_ITEMS.length) {
        total = CART_ITEMS.length;
      } else {
        total = TOTAL_CART_ITEMS.length;
      }

      // create response
      const response = new createResponse(
        httpStatus.OK,
        "Cart data fetched",
        "Cart data fetched successfully!",
        CART_ITEMS,
        total
      );

      res.status(response.status).send(response);
    }
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    console.log("error");
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.readAllAddresses = async (req, res) => {
  let userId = req.user.id;

  try {
    const GET_ADDRESSES = `
    SELECT * FROM address WHERE user_id = ${userId};`;

    const [ADDRESSES] = await database.execute(GET_ADDRESSES);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Address data fetched",
      "Address data fetched successfully!",
      ADDRESSES,
      ADDRESSES.length
    );

    res.status(response.status).send(response);
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.readAddressById = async (req, res) => {
  let userId = req.user.id;
  let addressId = req.params.addressId;

  try {
    const GET_ADDRESSES = `
    SELECT * FROM address WHERE user_id = ${userId} AND id=${addressId};`;

    const [ADDRESSES] = await database.execute(GET_ADDRESSES);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Address data fetched",
      "Address data fetched successfully!",
      ADDRESSES,
      ADDRESSES.length
    );

    res.status(response.status).send(response);
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.readCart = async (req, res) => {
  const userId = req.params.userId || 1;
  const page = req.query.page || 1;
  const offset = (page - 1) * 5;

  try {
    const GET_CART_ITEMS = `
    SELECT
    c.id,
    c.user_id,
    c.product_id,
      p.name,
      pc.name as category,
      p.stock,
    c.amount,
      p.stock-c.amount as remaining_stock,
      p.price,
      p.picture
    FROM cart_items c
    LEFT JOIN products p ON c.product_id = p.id 
      LEFT JOIN categories pc ON p.category = pc.id
    WHERE c.user_id = ${userId} LIMIT ${offset}, 5;`;

    const [CART_ITEMS] = await database.execute(GET_CART_ITEMS);

    if (!CART_ITEMS.length) {
      // create response
      const response = new createResponse(
        httpStatus.OK,
        "There isn't any items in the cart yet",
        "Cart item is not found.",
        CART_ITEMS,
        CART_ITEMS.length
      );

      res.status(response.status).send(response);
    } else {
      const GET_CART_ITEMS_TOTAL = `SELECT * FROM cart_items 
      WHERE user_id = ${userId};`;
      const [TOTAL_CART_ITEMS] = await database.execute(GET_CART_ITEMS_TOTAL);

      let total;
      if (TOTAL_CART_ITEMS <= CART_ITEMS.length) {
        total = CART_ITEMS.length;
      } else {
        total = TOTAL_CART_ITEMS.length;
      }

      // create response
      const response = new createResponse(
        httpStatus.OK,
        "Cart data fetched",
        "Cart data fetched successfully!",
        CART_ITEMS,
        total
      );

      res.status(response.status).send(response);
    }
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    console.log("error");
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.addAddress = async (req, res) => {
  let userId = req.user.id;
  let {
    newLabel: label,
    newAddress: address,
    newPhone: phone,
    newZip: postal_code,
    newCity: city,
    newProvince: province,
  } = req.body;

  console.log(req.body);

  try {
    // Gunakan Joi untuk validasi data dari body
    const { error } = addAddressSchema.validate({
      label,
      address,
      phone,
      postal_code,
      city,
      province,
    });
    if (error) {
      throw new createError(
        httpStatus.Bad_Request,
        "Create product failed",
        error.details[0].message
      );
    }

    // validation for duplicate data
    const CHECK_ITEM = `
            SELECT id
            FROM address
            WHERE user_id = ${database.escape(
              userId
            )} AND label = ${database.escape(label)};`;
    const [ITEM] = await database.execute(CHECK_ITEM);

    if (ITEM.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Create address failed",
        "Address label already exists!"
      );
    } else {
      // define query
      const ADD_ADDRESS = `
      INSERT INTO address(user_id, label, address, phone, postal_code, city, province)
      VALUES(
          ${database.escape(userId)},${database.escape(
        label
      )},${database.escape(address)},${database.escape(
        phone
      )},${database.escape(postal_code)},${database.escape(
        city
      )},${database.escape(province)}
      );
  `;
      const [ADDRESS_ADDED] = await database.execute(ADD_ADDRESS);

      // create respond
      const response = new createResponse(
        httpStatus.OK,
        "Add address success",
        `Your new address is created.`,
        ADDRESS_ADDED,
        ""
      );
      res.status(response.status).send(response);
    }
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.addInvoice = async (req, res) => {
  let {
    // userId,
    addressId,
    shopping_amount,
    shipping_cost,
    payment_method,
    status,
  } = req.body;

  let userId = req.user.id;

  console.log(req.body);

  const today = new Date();
  const twoDaysLater = new Date();

  twoDaysLater.setDate(today.getDate() + 2);

  let expiredDate = twoDaysLater.toJSON().slice(0, 19).replace("T", " ");

  let invoiceCode = uid().toUpperCase();

  try {
    // // Gunakan Joi untuk validasi data dari body
    // const { error } = addAddressSchema.validate({
    //   label,
    //   address,
    //   phone,
    //   postal_code,
    //   city,
    //   province,
    // });
    // if (error) {
    //   throw new createError(
    //     httpStatus.Bad_Request,
    //     "Create product failed",
    //     error.details[0].message
    //   );
    // }

    // define query

    const GET_ADDRESSES = `
    SELECT * FROM address WHERE user_id = ${userId} AND id=${addressId};`;

    const [ADDRESSES] = await database.execute(GET_ADDRESSES);
    const addressData = ADDRESSES[0];

    const GET_CART_ITEMS = `
      SELECT
      c.id,
      c.user_id,
      c.product_id,
        p.name,
        p.description,
        pc.name as category,
        p.stock,
        p.unit,
      c.amount,
        p.stock-c.amount as remaining_stock,
        p.price,
        p.picture
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
        LEFT JOIN categories pc ON p.category = pc.id
      WHERE c.user_id = ${userId};`;

    const ADD_INVOICE_HEADER = `
        INSERT INTO invoice_headers(code, user_id, address, phone, postal_code, city, province, shopping_amount, shipping_cost, total_payment, payment_method, status, expired_date)
        VALUES(${database.escape(invoiceCode)},
            ${database.escape(userId)},${database.escape(
      addressData.address
    )},${database.escape(addressData.phone)},${database.escape(
      addressData.postal_code
    )},${database.escape(addressData.city)},${database.escape(
      addressData.province
    )},${database.escape(shopping_amount)}, ${database.escape(
      shipping_cost
    )}, ${database.escape(shopping_amount + shipping_cost)}, ${database.escape(
      payment_method
    )},${database.escape(status)}, ${database.escape(expiredDate)}
        );
    `;

    const [CART_ITEMS] = await database.execute(GET_CART_ITEMS);
    const [INVOICE_HEADER_ADDED] = await database.execute(ADD_INVOICE_HEADER);

    const invoiceHeaderId = INVOICE_HEADER_ADDED.insertId;

    console.log("invoiceHeaderId", invoiceHeaderId);

    CART_ITEMS.map(async (cartItem) => {
      const ADD_INVOICE_DETAIL = `
      INSERT INTO invoice_details(invoice_header_id, product_id, price, amount, unit)
      VALUES(
        ${database.escape(invoiceHeaderId)},${database.escape(
        cartItem.product_id
      )},${database.escape(cartItem.price)},${database.escape(
        cartItem.amount
      )},${database.escape(cartItem.unit)}
    );`;

      // console.log(ADD_INVOICE_DETAIL);
      const INVOICE_DETAIL_ADDED = await database.execute(ADD_INVOICE_DETAIL);

      const DECREASE_PRODUCT_STOCK = `
          UPDATE products
          SET stock_in_unit = GREATEST(stock_in_unit-${database.escape(
            cartItem.amount
          )},0), stock= GREATEST(CEIL(stock_in_unit/volume),0)
          WHERE id=${database.escape(cartItem.product_id)};`;
      console.log(DECREASE_PRODUCT_STOCK);

      const INCREASE_PRODUCT_SOLD = `
      UPDATE products
      SET sold = sold+${database.escape(
        cartItem.amount
      )}, sold_times= sold_times+1
      WHERE id=${database.escape(cartItem.product_id)};`;
      console.log(INCREASE_PRODUCT_SOLD);

      await database.execute(DECREASE_PRODUCT_STOCK);
      await database.execute(INCREASE_PRODUCT_SOLD);
    });

    const DELETE_CART_ITEMS = `
      DELETE FROM cart_items WHERE user_id=${database.escape(userId)};`;

    const CART_ITEMS_DELETED = await database.execute(DELETE_CART_ITEMS);

    // create respond
    const response = new createResponse(
      httpStatus.OK,
      "Add invoice success",
      `Your new invoice is created.`,
      invoiceCode,
      CART_ITEMS
    );
    res.status(response.status).send(response);
    // res.status(200).send("ok");
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.readInvoice = async (req, res) => {
  let userId = req.user.id;
  let invoiceCode = req.params.invoiceCode;

  try {
    // const GET_INVOICE_ITEMS = `
    // SELECT
    // h.id, h.code, h.user_id, date_format(h.date, '%M %e, %Y') as date, h.address_id, a.address, a.city, a.province, a.postal_code, h.shipping_cost, h.total_payment, h.payment_method,
    // h.status, d.invoice_header_id, d.product_id, p.name, d.price, d.amount, d.unit
    //     FROM invoice_headers h
    //     LEFT JOIN invoice_details d ON h.id = d.invoice_header_id
    //     LEFT JOIN products p ON d.product_id = p.id
    //     LEFT JOIN address a ON h.address_id = a.id
    //     WHERE h.user_id = ${database.escape(userId)} AND d.invoice_header_id=(
    //         SELECT
    //         id
    //         FROM invoice_headers
    //         WHERE user_id = ${database.escape(userId)}
    //         ORDER  BY date DESC
    //         LIMIT 1);`;

    const GET_INVOICE_ITEMS = `
    SELECT
    h.id, h.code, h.user_id, u.first_name, u.last_name, h.phone, date_format(h.date, '%M %e, %Y') as date, date_format(h.expired_date, '%M %e, %Y') as expired_date, h.address, h.city, h.province, h.postal_code, h.shipping_cost, h.total_payment, h.payment_method,
    h.status, d.invoice_header_id, d.product_id, p.name, d.price, d.amount, d.unit, date_format(py.created_at, '%M %e, %Y') as payment_date
        FROM invoice_headers h 
        LEFT JOIN invoice_details d ON h.id = d.invoice_header_id
        LEFT JOIN products p ON d.product_id = p.id
        LEFT JOIN users u ON h.user_id = u.id
        LEFT JOIN payments py ON h.id = py.invoice_id
        WHERE h.user_id = ${database.escape(
          userId
        )} AND h.code= ${database.escape(invoiceCode)};`;

    const [INVOICE_ITEMS] = await database.execute(GET_INVOICE_ITEMS);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Address data fetched",
      "Address data fetched successfully!",
      INVOICE_ITEMS,
      INVOICE_ITEMS.length
    );

    res.status(response.status).send(response);
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};

module.exports.createPaymentProof = (req, res) => {
  let path = "/payment-proof";

  const upload = uploader(path, "IMG").fields([{ name: "file" }]);

  console.log("req");

  upload(req, res, async (error) => {
    try {
      // if (error) {
      //   throw new createError(
      //     httpStatus.Internal_Server_Error,
      //     "Internal Server Error",
      //     "Create product failed."
      //   );
      // }

      let data = JSON.parse(req.body.data);
      let { invoiceId } = data;
      console.log(invoiceId, "invoiceid");

      // Gunakan Joi untuk validasi data dari body
      const { error } = addProofSchema.validate(data);
      if (error) {
        throw new createError(
          httpStatus.Bad_Request,
          "Upload process failed",
          error.details[0].message
        );
      }

      const CREATE_PROOF_OF_PAYMENT = `INSERT INTO payments (invoice_id) VALUES(${database.escape(
        invoiceId
      )});`;
      const [PROOF_OF_PAYMENT] = await database.execute(
        CREATE_PROOF_OF_PAYMENT
      );

      const GET_PROOF_OF_PAYMENT_ID = `SELECT LAST_INSERT_ID();`;
      let PROOF_OF_PAYMENT_ID = await database.execute(GET_PROOF_OF_PAYMENT_ID);
      let paymentId = PROOF_OF_PAYMENT_ID[0][0]["LAST_INSERT_ID()"];

      // Image table
      console.log(req.files);
      const { file } = req.files;
      console.log("file", file);

      let imageQuery = "";

      for (var i = 0; i < file.length; i++) {
        imageQuery += `(${database.escape(paymentId)}, ${database.escape(
          path + "/" + file[i].filename
        )}),`;
      }

      console.log(imageQuery);

      // let INSERT_IMAGES = `INSERT INTO products(restaurantId, imageUrl) VALUES ${imageQuery.slice(
      //   0,
      //   -1
      // )};`;
      // console.log(INSERT_IMAGES);
      let INSERT_IMAGES = `UPDATE payments SET picture_url=${database.escape(
        path + "/" + file[0].filename
      )} WHERE id=${database.escape(paymentId)};`;
      console.log(INSERT_IMAGES);

      const UPDATE_INVOICE_STATUS = `UPDATE invoice_headers SET status='Waiting for verification'
      WHERE id=${database.escape(invoiceId)};`;
      const [INVOICE_STATUS] = await database.execute(UPDATE_INVOICE_STATUS);

      console.log(INVOICE_STATUS);

      databaseSync.query(INSERT_IMAGES, (err, results) => {
        if (err) {
          console.log(err);
          throw new createError(
            httpStatus.Internal_Server_Error,
            "Upload failed",
            "Upload image failed!"
          );
        }
        return;
      });

      const response = new createResponse(
        httpStatus.OK,
        "Add payment proof success",
        "Please wait for admin verification",
        paymentId,
        ""
      );

      res.status(response.status).send(response);
      // res.status(200).send("ok");
    } catch (err) {
      console.log("error : ", err);
      const isTrusted = err instanceof createError;
      if (!isTrusted) {
        err = new createError(
          httpStatus.Internal_Server_Error,
          "SQL Script Error",
          err.sqlMessage
        );
        console.log(err);
      }
      res.status(err.status).send(err);
    }
  });
};

module.exports.updateInvoice = async (req, res) => {
  let { code } = req.body;

  try {
    // 1. Check data apakah product exist di dalam database
    const FIND_INVOICE_HEADER = `SELECT * FROM invoice_headers WHERE code = ${database.escape(
      code
    )};`;

    const [INVOICE_HEADER] = await database.execute(FIND_INVOICE_HEADER);
    if (!INVOICE_HEADER.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Invoice update failed",
        "Invoice is not exist!"
      );
    }

    // 2. Check apakah body memiliki content
    const isEmpty = !Object.keys(req.body).length;
    if (isEmpty) {
      throw new createError(
        httpStatus.Bad_Request,
        "Invoice update failed",
        "Your update form is incomplete!"
      );
    }

    //  3. Buat query untuk update
    const UPDATE_INVOICE = `UPDATE invoice_headers SET status = 'Approved' WHERE code = ${database.escape(
      code
    )};`;
    const [UPDATED_INVOICE] = await database.execute(UPDATE_INVOICE);

    const response = new createResponse(
      httpStatus.OK,
      "Update invoice success",
      "Invoice update saved successfully!",
      "",
      ""
    );

    res.status(response.status).send(response);
  } catch (err) {
    console.log("error : ", err);
    const isTrusted = err instanceof createError;
    if (!isTrusted) {
      err = new createError(
        httpStatus.Internal_Server_Error,
        "SQL Script Error",
        err.sqlMessage
      );
      console.log(err);
    }
    res.status(err.status).send(err);
  }
};
