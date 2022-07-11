const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const db = require("../../config").promise();
const {
  loginSchema,
  registerSchema,
} = require("../../helpers/validation-schema");
const { createToken } = require("../../helpers/createToken");
const transporter = require("../../helpers/nodemailer");
// const { user } = require("..");
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

    // 4. create JWT token
    const { email, status, id, uid } = USER[0];
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
  const { emailUser, username } = req.body;
  try {
    // check users
    const CHECK_USER = `SELECT * FROM users WHERE email = ?`;
    const [USER] = await db.execute(CHECK_USER, [emailUser]);
    if (!USER.length) {
      return res.status(400).send("email not registered");
    }

    // user exist
    // bahan membuat token
    const { email, id, uid } = USER[0];
    console.log("emailku:", email);
    let token = createToken({ username, email, id });
    console.log("Token:", token);
    let mail = {
      from: `Admin <zilongbootcamp@gmail.com>`,
      to: `${email}`,
      subject: `Reset Password`,
      html: `<a href='http://localhost:3000/resetpassword/${token}'> Click here to reset your password</a>`,
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
  const { email, password, repassword } = req.body;
  try {
    // 1. verify password & repassword
    if (password !== repassword) {
      return res.status(400).send(`password and re-password doesn't match.`);
    }
    // 2.check email
    const CHECK_USER = `SELECT * FROM users WHERE email = ?`;
    const [USER] = await db.execute(CHECK_USER, [email]);
    if (!USER.length) {
      return res.status(400).send("email not registered");
    }
    const { id } = USER[0];
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

      let mail = {
        from: `Admin <zilongbootcamp@gmail.com>`,
        to: `${email}`,
        subject: `Account verification`,
        html: `<a href='http://localhost:3000/authentication/${token}'> Click here for verification your account</a>`,
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
