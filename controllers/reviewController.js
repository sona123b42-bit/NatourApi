const Review = require('./../model/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// router
exports.getAllReview = factory.getAll(Review);
exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.addNewReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
