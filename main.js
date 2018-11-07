var express = require('express'),
    path = require('path'),
    app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile( __dirname + '/' + 'index.html');
});

var server = app.listen(8090, function() {
  console.log('Example now listening on port 8090...');
});
