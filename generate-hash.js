const bcrypt = require('bcryptjs');

// The password required by the assignment
const password = 'admin123';

bcrypt.hash(password, 10, function(err, hash) {
  console.log("---------------------------------------------------");
  console.log("Password:", password);
  console.log("Your Hash:", hash);
  console.log("---------------------------------------------------");
  console.log("Copy the hash above and paste it into your schema.sql");
  console.log("inside the INSERT statement for the Admin user.");
});