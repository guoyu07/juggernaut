(function (global) {
  // round a float number to a specified number of digit after floating point
  global.round = function(value, numDigit) {
    var num = parseFloat(value);
    var factor = Math.pow(10, numDigit);
    return Math.round(num * factor) / factor;
  };

  // convert a duration in number of seconds to a human readable string
  var numSecondsInMinute = 60;
  var numSecondsInHour = numSecondsInMinute * 60;
  var numSecondsInDay = numSecondsInHour * 24;
  var genUnitString = function(num, unit) {
    if (num <= 0) return '';
    if (num === 1) return '1 ' + unit;
    return num + ' ' + unit + 's';
  };

  global.durationToString = function(seconds) {
    var days = Math.floor(seconds / numSecondsInDay);
    var hours = Math.floor((seconds % numSecondsInDay) / numSecondsInHour);
    var minutes = Math.floor((seconds % numSecondsInHour) / numSecondsInMinute);
    var res = '';
    if (days > 0) {
      if (days === 1) res = '1 day, ';
      else res = days + ' days, ';
    }
    if (hours > 0) {
      if (hours === 1) res += '1 hour, ';
      else res += hours + ' hours, ';
    }
    if (minutes === 1) res += '1 minute';
    else res += minutes + ' minutes';
    return res;
  };
})(window);

