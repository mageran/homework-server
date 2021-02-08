const express = require('express');
const app = express();

const services = [...require('./services/precalculus')];

const api = require('./api');
const { processTerm } = require('./solver');

app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/precalculus', (req, res) => {
  res.redirect('/precalculus.html');
});

// API methods
app.post('/api/parselatex', (req, res) => {
  const latex = req.body.latex;
  console.log(`latex: "${JSON.stringify(latex, null, 2)}"`);
  try {
    const ast = api.parseLatexTerm(latex);
    console.log(ast.toTermString());
    res.status(200);
    const resObj = { term: ast.toTermString() };
    res.send(JSON.stringify(resObj, null, 2));
  } catch (err) {
    res.status(404);
    const errObj = { error: err };
    console.log(err);
    res.send(JSON.stringify(errObj));
  }
})

services.forEach(({ service, rules, functor, resultVariable }) => {
  const uri = `/api/${service}`;
  app.post(uri, (req, res) => {
    const latex = req.body.latex;
    try {
      const term = api.parseLatexTerm(latex);
      console.log(`parsed: ${term.toTermString()}`);
      api.processLatexWithRules(latex, rules, functor, resultVariable, substMap => {
        res.status(200);
        console.log(substMap);
        const resObj = substMap;
        res.send(JSON.stringify(resObj, null, 2));
      })
    } catch (err) {
      res.status(404);
      const errObj = { error: err };
      console.log(err);
      res.send(JSON.stringify(errObj));
    }
  });
  console.log(`registered service: uri: ${uri}, rules: ${rules}, functor: ${functor}`);
});

// Listen to the App Engine-specified port, or 8090 otherwise
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});