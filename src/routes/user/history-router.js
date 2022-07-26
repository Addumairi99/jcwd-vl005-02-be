const express = require("express");
const router = express.Router();
const auth = require("../../helpers/authorization-token");

const { userHistoryController } = require("../../controllers");

router.get("/notifications", auth, userHistoryController.readAllNotifications);
router.patch(
  "/open-notification",
  auth,
  userHistoryController.openNotification
);
router.get(
  "/unopened-notifications",
  auth,
  userHistoryController.readUnopenedNotifications
);
router.get(
  "/generate-invoice/:invoiceCode",
  auth,
  userHistoryController.generateInvoice
);
router.get("/:purchaseState", auth, userHistoryController.readAllInvoice);

module.exports = router;
