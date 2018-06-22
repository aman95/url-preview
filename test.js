const preview = require('./index');

preview.handler({url: 'https://www.google.com'}, null, function (err, res) {
    if(err) {
        console.log(err);
    }
    else {
        console.log(res);
    }
});