const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tours = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB connection is success');
  });
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// import data into db
const importData = async () => {
  try {
    await Tours.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// Delete data from db
const deleteDate = async () => {
  try {
    await Tours.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteDate();
}
// node dev-data/data/import-dev-data.js --import/--delete
