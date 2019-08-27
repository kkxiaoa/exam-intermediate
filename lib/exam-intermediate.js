"use strict";

const crypto = require("crypto");
const Mail = require("./mail");

// var capitalize = function(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }

var warn = function(msg) {
  if (msg) {throw msg;}
}

var signFn = function (secret, param) {
  var signStr = [];
  for (var i in param) {
    signStr.push(encodeURIComponent(i)+'='+encodeURIComponent(param[i]));
  }
  signStr.sort();
  signStr = "POST&%2F&" + encodeURIComponent(signStr.join('&'));
  const sign = crypto.createHmac("sha1", secret + '&')
    .update(signStr)
    .digest("base64");
  return encodeURIComponent(sign);
}

// var inject = function(source, target, props) {
//   props.forEach((element) => {
//     target[capitalize(element)] = source[element];
//   })
// }

module.exports.createTransport = function(config) {
  const nonce = Date.now();
  const date = new Date();
  let param,
    params,
    errMsg = [];
    config = config || {};
  if (!config.accessKeyID) {
    errMsg.push("accessKeyID required");
  }
  if (!config.accessKeySecret) {
    errMsg.push("accessKeySecret required");
  }
  if (!config.accountName) {
    errMsg.push("accountName required");
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
    if (!config.toAddress) {
      errMsg.push("toAddress required");
    }
    param.Action = "single";
    param.ReplyToAddress = config.replyToAddress;
    param.ToAddress = config.toAddress;
    param.FromAlias = config.fromAlias;
    param.Subject = config.subject;
    param.HtmlBody = config.htmlBody;
    param.TextBody = config.textBody;
  } else if (config.action === "batch") {
    if (!config.templateName) {
      errMsg.push("templateName required");
    }
    if (!config.receiversName) {
      errMsg.push("receiversName required");
    }
    param.Action = "batch";
    param.TemplateName = config.templateName;
    param.ReceiversName = config.receiversName;
    param.TagName = config.tagName;
  }
  if (errMsg.length) {
    warn(errMsg.join(','));
  }
  param.Signature = signFn(config.accessKeySecret, param);
  return new Mail(param);
}
