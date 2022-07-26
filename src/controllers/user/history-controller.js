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
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const hbs = require("handlebars");
const path = require("path");
// const data = require("../../templates/data.json");

const compile = async function (templateName, data) {
  const filePath = path.join(
    process.cwd(),
    "src/templates",
    `${templateName}.hbs`
  );
  const html = await fs.readFile(filePath, "utf8");
  // console.log(html);
  return hbs.compile(html)(data);
};

module.exports.readAllInvoice = async (req, res) => {
  let userId = req.user.id;
  let purchaseState = req.params.purchaseState;
  console.log(purchaseState);

  try {
    let GET_INVOICE_HEADERS;

    if (purchaseState == "all") {
      GET_INVOICE_HEADERS = `
    SELECT *, date_format(date, '%M %e, %Y') as date FROM invoice_headers
        WHERE user_id = ${database.escape(userId)} ;`;
    } else if (purchaseState == "finished") {
      GET_INVOICE_HEADERS = `
          SELECT *, date_format(date, '%M %e, %Y') as date FROM invoice_headers 
              WHERE user_id = ${database.escape(
                userId
              )} AND status='Approved' OR status = 'Rejected' ;`;
    } else {
      GET_INVOICE_HEADERS = `
        SELECT *, date_format(date, '%M %e, %Y') as date FROM invoice_headers 
            WHERE user_id = ${database.escape(
              userId
            )} AND status!='Approved' AND status!='Rejected';`;
    }
    const [INVOICE_HEADERS] = await database.execute(GET_INVOICE_HEADERS);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Invoice data fetched",
      "Invoice data fetched successfully!",
      INVOICE_HEADERS,
      INVOICE_HEADERS.length
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

module.exports.readAllNotifications = async (req, res) => {
  let userId = req.user.id;
  console.log("jalan");
  console.log("USER ID", userId);

  try {
    const GET_NOTIFICATIONS = `
    SELECT *, date_format(created_at, '%M %e, %Y') as date FROM user_notifications
        WHERE user_id = ${database.escape(userId)} ;`;

    const [NOTIFICATIONS] = await database.execute(GET_NOTIFICATIONS);

    // console.log(NOTIFICATIONS);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Notification data fetched",
      "Notification data fetched successfully!",
      NOTIFICATIONS,
      NOTIFICATIONS.length
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

module.exports.generateInvoice = async (req, res) => {
  let userId = req.user.id;
  let invoiceCode = req.params.invoiceCode;

  let data = {};

  try {
    const GET_INVOICE_HEADER = `
    SELECT
    h.id,h.code, h.user_id, u.first_name, u.last_name, date_format(h.date, '%M %e, %Y') as created_date, date_format(h.expired_date, '%M %e, %Y') as expired_date, 
     h.phone, h.address, h.city, h.province, h.postal_code, 
	FORMAT(h.shopping_amount,2,'id_ID') as shopping_amount,
    FORMAT(h.shipping_cost,2,'id_ID') as shipping_cost,
    FORMAT(h.total_payment,2,'id_ID') as total_payment, 
    h.payment_method,
    h.status,  date_format(p.created_at, '%M %e, %Y') as payment_date
        FROM invoice_headers h 
        LEFT JOIN users u ON h.user_id = u.id
        LEFT JOIN payments p ON p.invoice_id = h.id
        WHERE h.user_id = ${database.escape(
          userId
        )} AND h.code= ${database.escape(invoiceCode)};`;

    const [INVOICE_HEADER] = await database.execute(GET_INVOICE_HEADER);

    const GET_INVOICE_ITEMS = `
    SELECT
    d.product_id, p.name, FORMAT(d.price,2,'id_ID') as price, d.amount, d.unit, 
    FORMAT(CAST(d.amount * d.price AS decimal(15,2)),2,'id_ID') as total
       FROM invoice_headers h 
       LEFT JOIN invoice_details d ON h.id = d.invoice_header_id
       LEFT JOIN products p ON d.product_id = p.id
        WHERE h.user_id = ${database.escape(
          userId
        )} AND h.code= ${database.escape(invoiceCode)};`;

    const [INVOICE_ITEMS] = await database.execute(GET_INVOICE_ITEMS);

    data = {
      ...data,
      invoiceHeader: INVOICE_HEADER[0],
      invoiceItems: INVOICE_ITEMS,
    };

    // console.log(data);
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

  async function printPDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const content = await compile("index", data);
    // console.log(content);
    // await page.setContent("<h1>Hello</h1>");
    await page.setContent(content);
    // await page.emulateMediaType("screen");
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();
    return pdf;
  }

  printPDF().then((pdf) => {
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });
    res.send(pdf);
  });
};

module.exports.readUnopenedNotifications = async (req, res) => {
  let userId = req.user.id;

  try {
    const GET_UNOPENED_NOTIFICATIONS = `
    SELECT *, date_format(created_at, '%M %e, %Y') as date FROM user_notifications
        WHERE user_id = ${database.escape(
          userId
        )} AND opened='false' ORDER BY created_at LIMIT 5;`;

    const [UNOPENED_NOTIFICATIONS] = await database.execute(
      GET_UNOPENED_NOTIFICATIONS
    );

    const GET_NOTIFICATIONS = `
    SELECT *, date_format(created_at, '%M %e, %Y') as date FROM user_notifications
        WHERE user_id = ${database.escape(userId)} AND opened='false';`;

    const [NOTIFICATIONS] = await database.execute(GET_NOTIFICATIONS);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Notification data fetched",
      "Notification data fetched successfully!",
      UNOPENED_NOTIFICATIONS,
      NOTIFICATIONS.length
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

module.exports.openNotification = async (req, res) => {
  let userId = req.user.id;
  let notificationId = req.body.notificationId;

  try {
    const OPEN_NOTIFICATION = `
    UPDATE user_notifications SET opened='true'
    WHERE user_id=${database.escape(userId)} AND id=${database.escape(
      notificationId
    )};`;

    const [OPENED_NOTIFICATION] = await database.execute(OPEN_NOTIFICATION);

    // create response
    const response = new createResponse(
      httpStatus.OK,
      "Notification data fetched",
      "Notification data fetched successfully!",
      OPENED_NOTIFICATION,
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
