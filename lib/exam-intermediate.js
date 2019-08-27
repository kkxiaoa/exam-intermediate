"use strict";

const crypto = require("crypto");
const Mail = require("./mail");

var capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

var warn = function(msg) {
  if (msg) {throw msg;}
}

var signFn = function (secret, param) {
  var signStr = [];
  for (var i in param) {
    signStr.push(encodeURIComponent(i)+'='+encodeURIComponent(param[i]));
  }
  signStr.sort()
  signStr = signStr.join('&')
  signStr = "POST&%2F&" + encodeURIComponent(signStr)
  const sign = crypto.createHmac("sha1", secret + '&')
    .update(signStr)
    .digest('base64');
  return encodeURIComponent(sign)
}

var propValidateCheck = function(obj, props) {
  var errMsg = [];
  if (obj["action"] === "single") {
    props.push("toAddress");
  } else if (obj["action"] === "batch") {
    props.splice(props.length-1, 0, "templateName", "receiversName");
  } else {
    errMsg.push("error action");
  }
  for (var i = 0; i < props.length; i++) {
    if(!obj[props[i]]) {
      errMsg.push(props + " required");
    }
  }
  return errMsg
}

var inject = function(source, target, props) {
  props.forEach(element => {
    target[capitalize(element)] = source[element];
  })
}

module.exports.createTransport = function(config) {
  const nonce = Date.now();
  const date = new Date();
  let param,
    params,
    props = [
      "accessKeyID",
      "accessKeySecret",
      "accountName"
    ];
  config = config || {};
  var errMsgList = propValidateCheck(config, props).length;
  if (errMsgList.length) {
    warn(errMsgList.join(','));
  }
  param = {
    AccessKeyId: config.accessKeyID,
    AccountName: config.accountName,
    AddressType:
      typeof config.addressType == "undefined" ? 0 : config.addressType,
    TemplateCode: config.templateCode,
    Format: "JSON",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: nonce,
    SignatureVersion: "1.0",
    Timestamp: date.toISOString(),
    Version: date
  }
  if (config.action === "single") {
    param.Action = "single";
    params = [
      "replyToAddress",
      "toAddress",
      "fromAlias",
      "subject",
      "htmlBody",
      "textBody"
    ]
    inject(config, param, params);
  } else if (config.action === "batch") {
    param.Action = "batch";
    params = [
      "templateName",
      "receiversName",
      "tagName"
    ]
    inject(config, param, params);
  }
  param["Signature"] = signFn(config.accessKeySecret, param);
  return new Mail(param);
}
