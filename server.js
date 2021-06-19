const app = require('express')();
app.get('/', (req, res) => {
  res.send('Server is up.');
  res.end();
});
module.exports = () => {
  app.listen(8081);
}