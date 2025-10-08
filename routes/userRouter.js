const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetpassword);
router.get('/isLoggedIn', authController.isLoggedIn);
// need to login to do all this
// use this so that after this middleware every route have this protect middleware
router.use(authController.protect);
router.get('/logout', authController.logout);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUserById);
router.patch('/updateMyPassword', authController.updatePassword);
// Restrict only specific admin routes
router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUser)
  .post(authController.restrictTo('admin'), userController.createUser);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUserById)
  .patch(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
