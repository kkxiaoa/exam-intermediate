const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mailTransport = require("./lib/exam-intermediate");

app.set("port", (process.env.port || 8008));
app.use(bodyParser.json());
app.use("/", express.static("./public"));

app.post("/api/email", (req, res) => {
  try {
    let male = mailTransport.createTransport(req.body);
    male.sendMail().then((response) => {
      res.status(200);
      res.json({
        code: 0,
        errMsg: "ok",
        data: response
      });
    }).catch((err) => {
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
app.listen(app.get("port"), () => {
  console.log("preview page http://localhost:" + app.get("port"));
});
