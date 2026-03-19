const bcrypt = require('bcryptjs');

const password = 'admin123';
bcrypt.hash(password, 10).then(hash => {
  console.log('Generated hash for admin123:', hash);
}).catch(err => {
  console.error('Bcrypt error:', err);
});
