const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/precalculus', (req, res) => {
  res.redirect('/precalculus.html');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});