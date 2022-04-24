const moment = require("moment");

function formatMessage(full_name, text) {
  return { full_name, text, time: moment().format("h:mm a") };
}

module.exports = formatMessage;
