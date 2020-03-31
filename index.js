
const http = require('http');
const fs = require('fs');
const static = require('node-static');

const PORT = process.env.PORT || 5000;
const file = new static.Server('./public');

let obj;
let lessonsArray;

function creareLessonTable(arr) {
		let result = '';
		result = result + '<html><body><table>';
		result = result + '<tr>';
		result = result + `<td>Number</td>`;
		result = result + `<td>Lessons title</td>`;
		result = result + '</tr>';

		for (let i = arr.length - 1; i >= 0; i--) {
			result = result + '<tr>';
			result = result + `<td>${arr[i].number}</td>`;
			result = result + `<td> 
			<a class="title" href="homeworks/${arr[i].id}">
      ${arr[i].title}
    </a></td>`;
			result = result + `<td>
			
			<button id="${arr[i].id}">X</button>
		
			</td>`;
			result = result + '</tr>';
		}
		result = result + '</table>';
		result = result + '<script src="http://localhost:5000/scripts.js"></script></body></html>';
		return result;
	}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */

const requestListener = (req, res) => {


	
	if (!req.url.startsWith('/homeworks')) {
		res.statusCode = 404;
		res.write('Wrong url');
		res.end();
		return;
	}

	fs.readFile('./homeworks.json', 'utf8', function (error, data) {
		if (error) {
			throw error; 
		}
		obj = data;
	});

	setTimeout(() => {
		lessonsArray = JSON.parse(obj.toString());

		if (req.url.startsWith('/homeworks')) {
			
				console.log(req.method);
			

			if (req.url === '/homeworks') {
				
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.write(creareLessonTable(lessonsArray));
				res.end();
				return;
			}

			let urlArray = req.url.split('/');
			requiredId = urlArray[urlArray.length - 1];

			let requiredLesson =	lessonsArray.find(lesson => {				
				return requiredId === lesson.id;				
			});

			if (requiredLesson) {
				console.log(`${requiredLesson.title}`);
				res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
				res.write(JSON.stringify(requiredLesson));

			} else {
				console.log('not such les');
				res.statusCode = 404;
				res.write('There is no such lesson');
			}
			res.end();
		}

		req.addListener('end', function () {
		file.serve(req, res)
	}).resume();

	}, 1000);


	





}
const server = http.createServer(requestListener);
server.listen(PORT);

