const _ = require('lodash');

exports.utils = {
  isValidDate: (date) => {
    let dateArray = date.split("-"),
        index = dateArray[0]
        year = dateArray[1],
        month = parseInt(dateArray[2], 10),
        day = parseInt(dateArray[3], 10);

    if ( (year.length === 4) && (month >= 1) && (month <= 12) && (day >= 1) && (day <= 31) ) {
      return true;
    } else {
      return false;
    }
  }
};
