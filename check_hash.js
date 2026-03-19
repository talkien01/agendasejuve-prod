const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2b$10$gfz0LAhkOykSj0y6pNvJyuL4XjGGfST.IJb5COddxb9TeeqibQYeLa';

bcrypt.compare(password, hash).then(res => {
  console.log('Password match:', res);
}).catch(err => {
  console.error('Bcrypt error:', err);
});
