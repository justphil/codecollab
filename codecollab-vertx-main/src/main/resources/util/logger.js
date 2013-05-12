var vertx = require('vertx');

module.exports = function(id) {
    var LOG = vertx.logger;
    var LOG_ID = id;

    var formatDigits = function(digit, numZeros) {
        var out = digit;

        if (out < 10) {
            var zeros = '';
            for (var i = 0; i < numZeros; i++) {
                zeros = zeros + '0';
            }

            out = zeros + '' + out;
        }
        else if (numZeros === 2 && digit < 100) {
            out = '0' + out;
        }

        return out;
    };

    this.i = function(msg) {
        var date        = new Date();
        var curr_day    = date.getDate();
        var curr_month  = date.getMonth() + 1; //Months are zero based
        var curr_year   = date.getFullYear();
        var curr_hour   = date.getHours();
        var curr_min    = date.getMinutes();
        var curr_sec    = date.getSeconds();
        var curr_milli  = date.getMilliseconds();

        curr_day    = formatDigits(curr_day, 1);
        curr_month  = formatDigits(curr_month, 1);
        curr_hour   = formatDigits(curr_hour, 1);
        curr_min    = formatDigits(curr_min, 1);
        curr_sec    = formatDigits(curr_sec, 1);
        curr_milli  = formatDigits(curr_milli, 2);

        LOG.info("[" + curr_year + '-'+curr_month+'-' +curr_day+ ' '
            +curr_hour+':' + curr_min + ':'+curr_sec+'.'+curr_milli
            + " # " + LOG_ID + "] " + msg);
    };
};