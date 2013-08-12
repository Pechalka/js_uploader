
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var app = express();

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: path.join(__dirname, 'views') });
app.engine('.html', ectRenderer.render);
app.set('view engine', 'html');

app.post('/upload', function(req, res){
	var file_name = req.headers['x-file-name'];
	var ws = fs.createWriteStream(path.join(__dirname, 'public', 'files', file_name));

	var file_size = 0;
	req.on('data', function(data){
		file_size = data.length;
		ws.write(data);
	});

	req.on('end', function(){	
		ws.end();
		var f = { name : file_name, size : file_size, date_dodified : new Date };
		console.log('uload', f);
		res.json(f);		
	});
})

app.get('/', function(req, res){
	var dir = path.join(__dirname, 'public', 'files');
	var files = fs.readdirSync(dir)
              .map(function(file_name) { 
              	var state = fs.statSync(path.join(dir, file_name))
              	return { name : file_name, date_dodified : state.mtime , size : state.size }; 
              });

    res.render('index.html', { files : JSON.stringify(files) });
});

app.post('/delete', function(req, res){
	var file_path = path.join(__dirname, 'public', 'files', req.body.file);
	console.log(file_path);
	fs.unlink(file_path, function (err) {
	  console.log(err);
	  res.json({ success : !err});
	});
	
})

http.createServer(app).listen(3000, function(){
  console.log('Express server listening on port 3000');
});
