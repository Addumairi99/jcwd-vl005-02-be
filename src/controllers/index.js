const adminProductController = require("./admin/product-controller");
const adminCategoryController = require("./admin/category-controller");
const adminTransactionContoller = require("./admin/transaction-controller")
const user = require("../controllers/user/user-controller");
const userProductController = require("./user/product-controller");
const userCartController = require("./user/cart-controller");
const userCheckoutController = require("./user/checkout-controller");
const braintreeController = require("./user/braintree-controller");
const userHistoryController = require("./user/history-controller");

module.exports = {
  adminProductController,
  adminCategoryController,
  adminTransactionContoller,
  user,
  userProductController,
  userCartController,
  userCheckoutController,
  braintreeController,
  userHistoryController,
};
