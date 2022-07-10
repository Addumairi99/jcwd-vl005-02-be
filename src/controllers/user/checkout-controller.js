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
  let userId = req.params.userId;
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
  let userId = req.params.userId;

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
  let userId = req.params.userId;
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
  let userId = req.params.userId;
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
    userId,
    addressId,
    total_payment,
    payment_method,
    payment_method_detail,
    status,
  } = req.body;

  console.log(req.body);

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

    const ADD_INVOICE_HEADER = `
      INSERT INTO invoice_headers(code, user_id, address_id, total_payment, payment_method, payment_method_detail, status)
      VALUES(${database.escape(invoiceCode)},
          ${database.escape(userId)},${database.escape(
      addressId
    )},${database.escape(total_payment)},${database.escape(
      payment_method
    )},${database.escape(payment_method_detail)},${database.escape(status)}
      );
  `;

    const GET_INVOICE_HEADER_ID = `SELECT LAST_INSERT_ID();`;

    const [CART_ITEMS] = await database.execute(GET_CART_ITEMS);
    const [INVOICE_HEADER_ADDED] = await database.execute(ADD_INVOICE_HEADER);
    const INVOICE_HEADER_ID = await database.execute(GET_INVOICE_HEADER_ID);
    const invoiceHeaderId = INVOICE_HEADER_ID[0][0]["LAST_INSERT_ID()"];

    // console.log(CART_ITEMS);

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

      const INVOICE_DETAIL_ADDED = await database.execute(ADD_INVOICE_DETAIL);
    });

    const DELETE_CART_ITEMS = `
    DELETE FROM cart_items WHERE user_id=${database.escape(userId)};`;

    const CART_ITEMS_DELETED = await database.execute(DELETE_CART_ITEMS);

    // create respond
    const response = new createResponse(
      httpStatus.OK,
      "Add invoice success",
      `Your new invoice is created.`,
      INVOICE_HEADER_ID[0][0]["LAST_INSERT_ID()"],
      CART_ITEMS
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

module.exports.readInvoice = async (req, res) => {
  let userId = req.params.userId;

  try {
    const GET_INVOICE_ITEMS = `
    SELECT
    h.id, h.code, h.user_id, date_format(h.date, '%M %e, %Y') as date, h.address_id, a.address, a.city, a.province, a.postal_code, h.total_payment, h.payment_method, h.payment_method_detail,
    h.status, d.invoice_header_id, d.product_id, p.name, d.price, d.amount, d.unit
        FROM invoice_headers h 
        LEFT JOIN invoice_details d ON h.id = d.invoice_header_id
        LEFT JOIN products p ON d.product_id = p.id
        LEFT JOIN address a ON h.address_id = a.id
        WHERE h.user_id = ${database.escape(userId)} AND d.invoice_header_id=(
            SELECT
            id 
            FROM invoice_headers  
            WHERE user_id = ${database.escape(userId)}
            ORDER  BY date DESC
            LIMIT 1);`;

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

      // Gunakan Joi untuk validasi data dari body
      const { error } = addProofSchema.validate(data);
      if (error) {
        throw new createError(
          httpStatus.Bad_Request,
          "Upload process failed",
          error.details[0].message
        );
      }

      const CREATE_PROOF_OF_PAYMENT = `INSERT INTO payments (invoice_id, status) VALUES( ${database.escape(
        invoiceId
      )}, 'Waiting for check');`;
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
