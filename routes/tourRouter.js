const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();
// router
//   .route('/:tourId/review')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.addNewReview
//   );
// router.param('id', tourController.checkID);
router.use('/:tourId/review', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTour);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/montly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/2333/center/-40,45/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.addNewTour
  );

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
