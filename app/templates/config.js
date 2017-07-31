module.exports = {
  db: process.env.MONGO_URL || 'mongodb://localhost/ardi-admin',
  env: process.env.ENV || 'dev'
}
