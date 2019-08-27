"use strict";

const axios = require("axios");

const url = "https://dm.aliyuncs.com/";

class Mail {
  constructor(bodyParser) {
    this.body = bodyParser;
  }
  sendMail() {
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: this.body,
        transformRequest: [function (data) {
          let transformReq = '';
          for (let prop in data) {
            transformReq += prop + '=' + data[prop] + '&';
          }
          return transformReq;
        }]
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    })
  }
}

module.exports = Mail