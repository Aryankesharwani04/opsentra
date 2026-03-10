const express = require("express");
const router = express.Router();
const { configureAWS } = require("../controllers/awsController");

router.post("/configure", configureAWS);

module.exports = router;
