const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
// 1️⃣ Storage: keep image filename + path
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users'); // 👈 folder where images go
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

// 2️⃣ Filter: only accept images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// 3️⃣ Create upload middleware
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 4️⃣ Middleware for single image
exports.uploadUserPhoto = upload.single('photo');
const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    date: null,
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user posts password data
  if (req.params.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Filter only name and photo fields
  const filteredBody = filterObj(req.body, 'name');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defind! Please use sign up again',
  });
};
exports.getAllUser = factory.getAll(User);
exports.getUserById = factory.getOne(User);
// Do not update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
