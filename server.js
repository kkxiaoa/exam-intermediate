const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mailTransport = require('./lib/exam-intermediate');

app.set('port', (process.env.port || 9001));
app.use(bodyParser.json());
app.use('/', express.static(path.resolve(__dirname + '/public')));

app.post('/api/email', (req, res) => {
  try {
    let male = mailTransport.createTransport(req.body)
    male.sendMail().then(response => {
      res.status(200);
      res.json({
        code: 0,
        errMsg: 'ok',
        data: response
      });
    }).catch(err => {
      res.status(500);
      res.json({
        errMsg: err
      });
    })
  }
  catch (err) {
    res.status(500);
    res.json({
      errMsg: err.message
    });
  }
})
app.listen(app.get('port'), () => {
  console.log('To preview this page at http://localhost:' + app.get('port'));
})
