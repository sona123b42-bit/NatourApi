const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetpassword);
// need to login to do all this
// use this so that after this middleware every route have this protect middleware
router.use(authController.protect);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUserById);
router.patch('/updateMyPassword', authController.updatePassword);
// only restrict to admin
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
