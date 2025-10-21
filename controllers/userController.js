const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const cloudinary = require('./../utils/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'users', // folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // optional resize
  },
});

const upload = multer({ storage });
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
  // ✅ Clear the JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(204).json({
    status: 'success',
    date: null,
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (req.file) {
    // Delete old Cloudinary photo if exists
    if (user.photo && user.photo.includes('res.cloudinary.com')) {
      try {
        const publicId = user.photo.split('/upload/')[1].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('⚠️ Cloudinary delete failed:', err.message);
      }
    }

    req.body.photo = req.file.path; // Cloudinary URL
  }

  const filteredBody = filterObj(req.body, 'name', 'photo');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
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
