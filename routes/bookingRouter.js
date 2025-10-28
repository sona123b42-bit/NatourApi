const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/create-checkout-session/:tourId',
  authController.protect,
  bookingController.createCheckoutSession
);

module.exports = router;
