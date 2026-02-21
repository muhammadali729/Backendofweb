const mongoose = require('mongoose');

const uri = 'mongodb+srv://innovlers:Shaikh!0123@cluster0.h1m8a8r.mongodb.net/mydatabase?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });
