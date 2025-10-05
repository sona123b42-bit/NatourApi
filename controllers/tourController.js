const Tours = require('./../model/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratinAverage,price';
  req.query.fields = 'name, price, ratingAverage, summary, difficulty';
  next();
};

// 2) Route handler
exports.getAllTour = factory.getAll(Tours);
exports.getTourById = factory.getOne(Tours, { path: 'review' });
exports.addNewTour = factory.createOne(Tours);
exports.updateTour = factory.updateOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);

// Get tour statistics
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  // Build aggregation pipeline
  const plan = await Tours.aggregate([
    // 1) Deconstruct the startDates array into separate documents
    { $unwind: '$startDates' },

    // 2) Match tours within the given year
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    // 3) Group by month and calculate stats
    {
      $group: {
        _id: { $month: '$startDates' }, // group by month number (1–12)
        numTourStarts: { $sum: 1 }, // count how many tours start that month
        tours: { $push: '$name' }, // collect tour names for that month
      },
    },

    // 4) Add month field for readability
    { $addFields: { month: '$_id' } },

    // 5) Hide the internal _id field
    { $project: { _id: 0 } },

    // 6) Sort by number of tour starts (descending)
    { $sort: { numTourStarts: -1 } },

    // 7) Limit results to 12 months (safety cap)
    { $limit: 12 },
  ]);

  // Send response
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format for lat, lng.',
        400
      )
    );
  }
  const tours = await Tours.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] },
    },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplyer = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format for lat, lng.',
        400
      )
    );
  }
  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplyer,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
