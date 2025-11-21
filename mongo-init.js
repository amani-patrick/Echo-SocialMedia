// mongo-init.js
db = db.getSiblingDB('admin');
db.createUser({
  user: 'echosols',
  pwd: 'echosols',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' }
  ]
});