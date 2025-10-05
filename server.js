// server.js (top of file)
require('dotenv').config({ path: './config.env' }); // load env variables

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection is success'));

const port = process.env.PORT || 10000; // ✅ Render provides its own port

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
