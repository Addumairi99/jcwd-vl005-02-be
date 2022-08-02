const database = require("../../config").promise();
const createError = require("../../helpers/createError");
const createResponse = require("../../helpers/createResponse");
const httpStatus = require("../../helpers/httpStatusCode");
const { editAddressSchema } = require("../../helpers/validation-schema");

module.exports.readAllAddress = async (req, res) => {
  let userId = req.user.id;

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
    SELECT * FROM address WHERE user_id = ${userId};`;

    const [ADDRESSES] = await database.execute(GET_ADDRESSES);

    // create respond
    const response = new createResponse(
      httpStatus.OK,
      "Get addresses success",
      `Your addresses are fetched.`,
      ADDRESSES,
      ADDRESSES.length
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

module.exports.deleteAddressById = async (req, res) => {
  const addressId = req.params.addressId;
  try {
    // check product data by its productId
    const CHECK_ADDRESS = `SELECT * FROM address WHERE id = ?;`;
    const [ADDRESS] = await database.execute(CHECK_ADDRESS, [addressId]);
    if (!ADDRESS.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Delete address failed",
        "Address is not exist!"
      );
    }

    // define query delete
    const DELETE_ADDRESS = `DELETE FROM address WHERE id = ?;`;
    const [DELETED_ADDRESS] = await database.execute(DELETE_ADDRESS, [
      addressId,
    ]);

    // send respond to client-side
    const response = new createResponse(
      httpStatus.OK,
      "Delete address success",
      "Address deleted successfully!",
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

module.exports.updateAddressById = async (req, res) => {
  const addressId = req.params.addressId;

  let {
    newLabel: label,
    newAddress: address,
    newPhone: phone,
    newZip: postal_code,
    newCity: city,
    newProvince: province,
  } = req.body;

  let body = { label, address, phone, postal_code, city, province };

  try {
    // 1. Check data apakah product exist di dalam database
    const FIND_ADDRESS = `SELECT * FROM address WHERE id = ${database.escape(
      addressId
    )};`;

    const [ADDRESS] = await database.execute(FIND_ADDRESS);
    if (!ADDRESS.length) {
      throw new createError(
        httpStatus.Bad_Request,
        "Address update failed",
        "Address is not exist!"
      );
    }

    // 2. Check apakah body memiliki content
    const isEmpty = !Object.keys(body).length;
    if (isEmpty) {
      throw new createError(
        httpStatus.Bad_Request,
        "Address update failed",
        "Your update form is incomplete!"
      );
    }

    // 3. Gunakan Joi untuk validasi data dari body
    const { error } = editAddressSchema.validate(body);
    if (error) {
      throw new createError(
        httpStatus.Bad_Request,
        "Address update failed",
        error.details[0].message
      );
    }

    //  4. Buat query untuk update
    let query = [];
    delete body.stock;
    for (let key in body) {
      query.push(`${key}='${body[key]}' `);
    }
    const UPDATE_ADDRESS = `UPDATE address SET ${query} WHERE id = ${database.escape(
      addressId
    )};`;
    console.log(UPDATE_ADDRESS);
    const [UPDATED_ADDRESS] = await database.execute(UPDATE_ADDRESS);
    console.log(UPDATED_ADDRESS[0]);

    const response = new createResponse(
      httpStatus.OK,
      "Update address success",
      "Address update saved successfully!",
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
