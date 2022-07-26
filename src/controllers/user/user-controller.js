const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const db = require("../../config").promise();
const {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} = require("../../helpers/validation-schema");
const { createToken } = require("../../helpers/createToken");
const transporter = require("../../helpers/nodemailer");
const createError = require("../../helpers/createError");
const createResponse = require("../../helpers/createResponse");
const httpStatus = require("../../helpers/httpStatusCode");
const PUBLIC_URL = process.env.PUBLIC_URL;

// LOGIN
module.exports.login = async (req, res) => {
  // username menampung nilai email dan username
  const { username, password } = req.body;

  try {
    // 1.validation login schema
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // 2. check if user exist or not
    const CHECK_USER = `SELECT * FROM users WHERE username = ${db.escape(
      username
    )} OR email = ${db.escape(username)};`;
    const [USER] = await db.execute(CHECK_USER);
    if (!USER.length) {
      return res.status(400).send("user is not registered");
    }

    // 3.compare password
    const valid = await bcrypt.compare(password, USER[0].password);
    console.log("is valid : ", valid);
    if (!valid) {
      return res.status(400).send("invalid password.");
    }
    // check user status
    if (USER[0].is_active == "banned") {
      return res.status(400).send("Your account has been banned");
    }
    // 4. create JWT token
    const { email, status, id } = USER[0];
    console.log("emailku:", email);
    let token = createToken({ username, email, id });
    console.log("Token:", token);

    // create respond
    delete USER[0].password;
    const respond = USER[0];
    res
      .header("Auth-Token", `Bearer ${token}`)
      .send({ dataLogin: respond, token, message: "Login Success" });
    console.log(USER[0]);
    // res.status(200).send(USER)
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

// KEEP LOGIN
module.exports.keeplogin = async (req, res) => {
  const token = req.header("Auth-Token");
  const id = req.user.id;
  try {
    const GET_USER = `SELECT * FROM users WHERE id = ?;`;
    const [USER] = await db.execute(GET_USER, [id]);

    // 4. create respond
    delete USER[0].password;
    const respond = USER[0];
    // console.log('mystatus:',USER[0].status)
    res.header("Auth-Token", `Bearer ${token}`).send(USER[0]);
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

// FORGET PASSWORD
module.exports.forgetpassword = async (req, res) => {
  const { Email, username } = req.body;
  try {
    // . verify req.body by our schema
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // check users
    const CHECK_USER = `SELECT * FROM users WHERE email = ?`;
    const [USER] = await db.execute(CHECK_USER, [Email]);
    if (!USER.length) {
      return res.status(400).send("email not registered");
    }

    // user exist
    // bahan membuat token
    const { email, id } = USER[0];
    console.log("emailku:", email);
    let token = createToken({ username, email, id });
    console.log("Token:", token);
    let mail = {
      from: `Admin <zilongbootcamp@gmail.com>`,
      to: `${email}`,
      subject: `Reset Password`,
      html: `<a href='${PUBLIC_URL}/resetpassword/${token}'> Click here to reset your password</a>`,
    };

    transporter.sendMail(mail, (errMail, resmail) => {
      if (errMail) {
        console.log(errMail);
        return res.status(500).send({
          message: "failed",
          success: false,
          err: errMail,
        });
      }
      return res.status(200).send({
        message: "Check your email",
        success: true,
      });
    });
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

// RESET PASSWORD
module.exports.resetpassword = async (req, res) => {
  const { password, repassword } = req.body;
  const id = req.user.id;

  try {
    console.log(id);
    // 1. verify password & repassword
    if (password !== repassword) {
      return res.status(400).send(`password and re-password doesn't match.`);
    }
    // 2. verify req.body by our schema
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // 3. encypt-ing or hash-ing password
    const salt = await bcrypt.genSalt(10);
    console.log("salt : ", salt);

    const hashpassword = await bcrypt.hash(password, salt);
    console.log("plain : ", password);
    console.log("hash: ", hashpassword);
    console.log("id:", id);

    // 4. UPDATE PASSWORD
    const EDIT_USER = `
        UPDATE users SET password= ${db.escape(hashpassword)} WHERE id= ${id}`;
    const [RESULT] = await db.execute(EDIT_USER);

    return res.status(200).send("Reset Password Berhasil");
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

// REGISTER
module.exports.register = async (req, res) => {
  const { username, email, firstName, lastName, password, repassword } =
    req.body;
  try {
    // 1. verify password & repassword
    if (password !== repassword) {
      return res.status(400).send(`password and re-password doesn't match.`);
    }
    // 2. verify req.body by our schema
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // 3.1 verify if username and email is unique
    const CHECK_USERNAME = `SELECT id FROM users WHERE username = ?;`;
    const [USERNAME] = await db.execute(CHECK_USERNAME, [username]);
    if (USERNAME.length) {
      return res
        .status(400)
        .send("Username already used, please use another username to register");
    }
    // 3.2 verify if  email is unique
    const CHECK_USEREMAIL = `SELECT id FROM users WHERE email = ?;`;
    const [USEREMAIL] = await db.execute(CHECK_USEREMAIL, [email]);
    if (USEREMAIL.length) {
      return res
        .status(400)
        .send("Email already used, please use another email to register");
    }
    // 5. encypt-ing or hash-ing password
    const salt = await bcrypt.genSalt(10);
    console.log("salt : ", salt);

    const hashpassword = await bcrypt.hash(password, salt);
    console.log("plain : ", password);
    console.log("hash: ", hashpassword);
    // 6. do query INSERT
    const INSERT_USER = `
         INSERT INTO users(first_name,last_name,email,username,password)
         VALUES(${db.escape(firstName)},${db.escape(lastName)}, ${db.escape(
      email
    )}, ${db.escape(username)}, ${db.escape(hashpassword)});
     `;
    const [USER] = await db.execute(INSERT_USER);
    console.log(USER.insertId);

    if (USER.insertId) {
      const GET_USER = `SELECT * FROM users WHERE id = ?`;
      const [RESULT] = await db.execute(GET_USER, [USER.insertId]);
      console.log(RESULT[0].id);

      // bahan membuat token
      const { username, email, status, id } = RESULT[0];
      let token = createToken({ username, email, status, id });
      console.log("Token:", token);

      // store token into database
      const INSERT_TOKEN = `INSERT INTO token(token) VALUES(${db.escape(
        token
      )});`;
      await db.execute(INSERT_TOKEN);

      let mail = {
        from: `Admin <zilongbootcamp@gmail.com>`,
        to: `${email}`,
        subject: `Account verification`,
        html: `<a href='${PUBLIC_URL}/authentication/${token}'> Click here for verification your account</a>`,
      };
      transporter.sendMail(mail, (errMail, resmail) => {
        if (errMail) {
          console.log(errMail);
          return res.status(500).send({
            message: "Registration failed",
            success: false,
            err: errMail,
          });
        }
        return res.status(200).send({
          message: "Registration success,check your email",
          success: true,
        });
      });
    }
    res
      .status(200)
      .send("user has been registered and please verify your account.");
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

// VERIFY USER
module.exports.verifyUser = async (req, res) => {
  const id = req.user.id;
  try {
    console.log("id", id);
    // change user status
    const UPDATE_USER = `UPDATE users SET is_verified ='verified' WHERE id = ?;`;
    const [INFO] = await db.execute(UPDATE_USER, [id]);
    res.status(200).send({ message: "Verified Account", success: true });
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};
// module.exports.verifyUser = async (req, res) => {
//   const id = req.user.id;
//   const token = req.header("Authorization");
//   // const newToken = token.replace("Bearer ", "");
//   // const token = req.params.token
//   try {
//     console.log("id", id);
//     console.log("veriv token:", newToken);

//     const CHECK_TOKEN = `SELECT token FROM token WHERE id = ? AND token = ?;`;
//     await db.execute(CHECK_TOKEN, [id, token]);

//     // if (!TOKEN.length) {
//     //   console.log("invalid token");
//     //   return res.status(400).send(`Invalid token`);
//     // }
//     // change user status
//     const UPDATE_USER = `UPDATE users SET is_verified ='verified' WHERE id = ?;`;
//     const [INFO] = await db.execute(UPDATE_USER, [id]);
//     res.status(200).send({ message: "Verified Account", success: true });
//   } catch (error) {
//     console.log("error:", error);
//     return res.status(500).send(error);
//   }
// };

// RESEND EMAIL VERIFICATION

module.exports.resendemail = async (req, res) => {
  const { is_verified, email, id } = req.body;
  try {
    let token = createToken({ email, id, is_verified });
    console.log("Token:", token);
    // store token into database
    // const INSERT_TOKEN = `INSERT INTO token(token) VALUES(${db.escape(
    //   token
    // )});`;
    // await db.execute(INSERT_TOKEN);
    let mail = {
      from: `Admin <zilongbootcamp@gmail.com>`,
      to: `${email}`,
      subject: `Account verification`,
      html: `<a href='${PUBLIC_URL}/authentication/${token}'> Click here for verification your account</a>`,
    };

    transporter.sendMail(mail, (errMail, resmail) => {
      if (errMail) {
        console.log(errMail);
        return res.status(500).send({
          message: "Resend email verification failed",
          success: false,
          err: errMail,
        });
      }
      return res.status(200).send({
        message: "Resend email verification success,check your email",
        success: true,
      });
    });

    return res
      .status(200)
      .send(
        "Resend email verification success,check your email to verify your account."
      );
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(error);
  }
};

module.exports.readUserById = async (req, res) => {
  let userId = req.user.id;

  try {
    const GET_USER_BY_ID = `
    SELECT *, date_format(created_at, '%M %e, %Y') as created_at
    FROM users
    WHERE id = ?; 
      `;
    const [USER] = await db.execute(GET_USER_BY_ID, [userId]);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "User data fetched",
      "User data fetched successfully!",
      USER[0],
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
