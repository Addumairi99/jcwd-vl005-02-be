const { uploader } = require("../../helpers/uploader");
const database = require("../../config").promise();
const databaseSync = require("../../config");
const createError = require("../../helpers/createError");
const createResponse = require("../../helpers/createResponse");
const httpStatus = require("../../helpers/httpStatusCode");
const {
  editProductSchema,
  addProductSchema,
} = require("../../helpers/validation-schema");

module.exports.getAdmin = async (req, res) => {
  console.log("sampe");
  res.status(200).send("<h1>Admin</h1>");
};

module.exports.readProducts = async (req, res) => {
  const page = req.query.page || 1;
  const name = req.query.name;
  const category = req.query.category;
  const limit = req.query.limit || 5;
  const sortBy = req.query.sortBy || "id";
  const order = req.query.order || "asc";
  const offset = (page - 1) * limit;
  console.log(page, limit, offset, name);
  try {
    // const CHECK_VERIFIED_USER = `SELECT isVerified,userId FROM users WHERE userId = ${database.escape(
    //   userId
    // )}`;
    // const [VERIFIED_USER] = await database.execute(CHECK_VERIFIED_USER);

    let GET_PRODUCTS;

    if (name) {
      GET_PRODUCTS = `SELECT 
      p.id, 
      p.name,
        p.picture, p.category,
        c.name as category_name,
      p.description, 
        p.price,p.stock, 
        p.stock_in_unit,
        p.volume,
        p.unit
    FROM products p
    LEFT JOIN categories c ON p.category = c.id WHERE p.name LIKE '%${name}%' ORDER BY ${sortBy} ${order} LIMIT ${offset}, ${limit} ;`;

      const [PRODUCTS] = await database.execute(GET_PRODUCTS);

      const response = new createResponse(
        httpStatus.OK,
        "Products data fetched",
        "Products data fetched successfully!",
        PRODUCTS,
        PRODUCTS.length
      );

      res.status(response.status).send(response);
    } else if (category) {
      GET_PRODUCTS = `SELECT 
      p.id, 
      p.name,
        p.picture, p.category,
      c.name as category_name,
      p.description, 
        p.price,
        p.stock, 
    p.stock_in_unit, 
        p.volume,
        p.unit
    FROM products p
    LEFT JOIN categories c ON p.category = c.id WHERE category LIKE '%${category}%' ORDER BY ${sortBy} ${order} LIMIT ${offset}, ${limit} ;`;

      const [PRODUCTS] = await database.execute(GET_PRODUCTS);

      const response = new createResponse(
        httpStatus.OK,
        "Products data fetched",
        "Products data fetched successfully!",
        PRODUCTS,
        PRODUCTS.length
      );

      res.status(response.status).send(response);
    } else {
      GET_PRODUCTS = `SELECT 
      p.id, 
      p.name,
        p.picture, p.category,
        c.name as category_name,
      p.description, 
        p.price,p.stock, 
        p.stock_in_unit, 
        p.volume,
        p.unit
    FROM products p
    LEFT JOIN categories c ON p.category = c.id ORDER BY ${sortBy} ${order} LIMIT ${offset}, ${limit};`;

      const [PRODUCTS] = await database.execute(GET_PRODUCTS);

      const GET_PRODUCTS_TOTAL = `SELECT * FROM products;`;
      const [TOTAL_PRODUCTS] = await database.execute(GET_PRODUCTS_TOTAL);

      const response = new createResponse(
        httpStatus.OK,
        "Products data fetched",
        "Products data fetched successfully!",
        PRODUCTS,
        TOTAL_PRODUCTS.length
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

module.exports.readProductById = async (req, res) => {
  const productId = req.params.productId;

  try {
    const GET_PRODUCT_BY_ID = `
    SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.category,
    c.name as category_name, 
    p.stock, 
    p.stock_in_unit,
    p.volume, 
    p.unit, 
    p.price, 
    p.picture
    FROM products p
    LEFT JOIN categories c ON p.category = c.id 
    WHERE p.id = ?; 
      `;
    const [PRODUCT] = await database.execute(GET_PRODUCT_BY_ID, [productId]);

    // validate
    if (!PRODUCT.length) {
      throw new createError(
        httpStatus.Internal_Server_Error,
        "There isn't any product yet",
        "Product is not found."
      );
    }

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Product data fetched",
      "Product data fetched successfully!",
      PRODUCT[0],
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

module.exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    // check product data by its productId
    const CHECK_PRODUCT = `SELECT * FROM products WHERE id = ?;`;
    const [PRODUCT] = await database.execute(CHECK_PRODUCT, [productId]);
    if (!PRODUCT.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Delete product failed",
        "Product is not exist!"
      );
    }

    // define query delete
    const DELETE_PRODUCT = `DELETE FROM products WHERE id = ?;`;
    const [DELETED_PRODUCT] = await database.execute(DELETE_PRODUCT, [
      productId,
    ]);

    // send respond to client-side
    const response = new createResponse(
      httpStatus.OK,
      "Delete product success",
      "Product deleted successfully!",
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

module.exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const body = req.body;
  console.log(productId, body);
  const stock = req.body.stock;

  try {
    // 1. Check data apakah product exist di dalam database
    const FIND_PRODUCT = `SELECT * FROM products WHERE id = ${database.escape(
      productId
    )};`;

    const [PRODUCT] = await database.execute(FIND_PRODUCT);
    if (!PRODUCT.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Product update failed",
        "Product is not exist!"
      );
    }

    // 2. Check apakah body memiliki content
    const isEmpty = !Object.keys(body).length;
    if (isEmpty) {
      throw new createError(
        httpStatus.Bad_Request,
        "Product update failed",
        "Your update form is incomplete!"
      );
    }

    // 3. Gunakan Joi untuk validasi data dari body
    const { error } = editProductSchema.validate(body);
    if (error) {
      throw new createError(
        httpStatus.Bad_Request,
        "Product update failed",
        error.details[0].message
      );
    }

    //  4. Buat query untuk update
    let query = [];
    delete body.stock;
    for (let key in body) {
      query.push(`${key}='${body[key]}' `);
    }
    const UPDATE_PRODUCT = `UPDATE products SET ${query} WHERE id = ${database.escape(
      productId
    )};`;
    console.log(UPDATE_PRODUCT);
    const [UPDATED_PRODUCT] = await database.execute(UPDATE_PRODUCT);
    console.log(UPDATED_PRODUCT[0]);

    const UPDATE_PRODUCT_STOCK = `
    UPDATE products
      SET stock_in_unit = (${database.escape(
        stock
      )}-stock)*volume + stock_in_unit, 
      stock= ${database.escape(stock)}
      WHERE id=${database.escape(productId)};`;
    await database.execute(UPDATE_PRODUCT_STOCK);

    const [FIND_UPDATED_PRODUCT] = await database.execute(FIND_PRODUCT);

    const response = new createResponse(
      httpStatus.OK,
      "Update product success",
      "Product update saved successfully!",
      FIND_UPDATED_PRODUCT[0],
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

module.exports.createProduct = (req, res) => {
  let newProduct;
  let path = "/product-images";
  let error;

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
      let { name, description, category, stock, volume, unit, price } = data;
      let stockInUnit = stock * volume;

      // Gunakan Joi untuk validasi data dari body
      const { error } = addProductSchema.validate(data);
      if (error) {
        throw new createError(
          httpStatus.Bad_Request,
          "Create product failed",
          error.details[0].message
        );
      }

      const CREATE_PRODUCT = `INSERT INTO products (name, description, category, stock, volume, unit, price, stock_in_unit) VALUES( ${database.escape(
        name
      )}, ${database.escape(description)}, ${database.escape(
        category
      )}, ${database.escape(stock)} , ${database.escape(
        volume
      )}, ${database.escape(unit)} , ${database.escape(
        price
      )}, ${database.escape(stockInUnit)});`;
      const [PRODUCT] = await database.execute(CREATE_PRODUCT);
      let productId = PRODUCT.insertId;
      newProduct = PRODUCT;
      console.log("PRODUCT", PRODUCT);

      // Image table
      console.log(req.files);
      const { file } = req.files;
      console.log("file", file);

      let imageQuery = "";

      for (var i = 0; i < file.length; i++) {
        imageQuery += `(${database.escape(productId)}, ${database.escape(
          path + "/" + file[i].filename
        )}),`;
      }

      console.log(imageQuery);

      // let INSERT_IMAGES = `INSERT INTO products(restaurantId, imageUrl) VALUES ${imageQuery.slice(
      //   0,
      //   -1
      // )};`;
      // console.log(INSERT_IMAGES);
      let INSERT_IMAGES = `UPDATE products SET picture=${database.escape(
        path + "/" + file[0].filename
      )} WHERE id=${database.escape(productId)};`;
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
        "Add product success",
        "Your product now can be seen by other users.",
        newProduct,
        productId
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

module.exports.sortProducts = async (req, res) => {
  // const page = req.query.page || 1;
  // const userId = req.query.userId;
  // const limit = 6;
  // const offset = (page - 1) * limit;
  const order = req.params.order;
  console.log(order);
  try {
    // const CHECK_VERIFIED_USER = `SELECT isVerified,userId FROM users WHERE userId = ${database.escape(
    //   userId
    // )}`;
    // const [VERIFIED_USER] = await database.execute(CHECK_VERIFIED_USER);

    const SORT_PRODUCTS = `SELECT * FROM products ORDER BY price ${order}`;
    console.log(SORT_PRODUCTS);
    const [PRODUCTS] = await database.execute(SORT_PRODUCTS);

    const response = new createResponse(
      httpStatus.OK,
      "Products data sorted",
      "Products data sorted successfully!",
      PRODUCTS,
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

module.exports.searchProducts = async (req, res) => {
  // const page = req.query.page || 1;
  // const userId = req.query.userId;
  // const limit = 6;
  // const offset = (page - 1) * limit;
  const query = req.query.q;
  console.log(query);
  try {
    // const CHECK_VERIFIED_USER = `SELECT isVerified,userId FROM users WHERE userId = ${database.escape(
    //   userId
    // )}`;
    // const [VERIFIED_USER] = await database.execute(CHECK_VERIFIED_USER);

    // const SEARCH_PRODUCTS = `SELECT * FROM products WHERE name LIKE '%?%';`;
    const SEARCH_PRODUCTS = `SELECT * FROM products WHERE name LIKE '%${query}%';`;

    console.log(SEARCH_PRODUCTS);
    const [PRODUCTS] = await database.execute(SEARCH_PRODUCTS);
    console.log(PRODUCTS);

    const response = new createResponse(
      httpStatus.OK,
      "Products data fetched",
      `${PRODUCTS.length} product(s) found!`,
      PRODUCTS,
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
