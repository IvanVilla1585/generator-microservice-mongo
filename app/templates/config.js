module.exports = {
  db: process.env.MONGO_URL || '<%= mongoURL %>',
  env: process.env.ENV || 'dev'
}
