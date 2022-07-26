const router = require("express").Router();
const { auth } = require("../../helpers/authToken");

const autho = require("../../helpers/authorization-token");

// import user controller
const { user } = require("../../controllers");

// define route
router.post("/login", user.login);
router.get("/keeplogin", autho, user.keeplogin);
router.post("/forgotpassword", user.forgetpassword);
router.post("/resetpassword", auth, user.resetpassword);
router.post("/register", user.register);
router.patch("/verified", auth, user.verifyUser);
router.post("/resendemail", user.resendemail);
router.get("/user-data", autho, user.readUserById);

// export * modules
module.exports = router;
