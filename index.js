
const http = require('http');
const fs = require('fs');
const static = require('node-static');

const PORT = process.env.PORT || 5000;
const file = new static.Server('./public');

const howeworksUrl = '/homeworks';

function createLessonsTable(arr) {
	let result = '';
	result = result + '<html><body><table>';
	result = result + '<tr>';
	result = result + `<td>Number</td>`;
	result = result + `<td>Lessons title</td>`;
	result = result + '</tr>';

	for (let i = arr.length - 1; i >= 0; i--) {
		let id = arr[i].id;
		result = result + '<tr>';
		result = result + `<td>${arr[i].number}</td>`;
		result = result + '<td>';
		result = result + `<a class="title" href="homeworks/${arr[i].id}">${arr[i].title}</a>`;
		result = result + '</td>';
		result = result + '<td>';
		result = result + `<button onclick= "buttonClick('${id}')">X</button>`;
		result = result + '</td>';
		result = result + '</tr>';
	}
	result = result + '</table>';
	result = result + '<script src="./scripts.js"></script></body></html>';
	return result;
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */

const requestListener = (req, res) => {
	req.addListener('end', function () {

		if (!req.url.startsWith(howeworksUrl)) {
			file.serve(req, res);
			return;
		}

		if (req.url.startsWith(howeworksUrl)) {
			fs.readFile('./homeworks.json', 'utf8', function (error, data) {
				if (error) {
					throw error;
				}
				const lessonsArray = JSON.parse(data.toString());

				if (req.url === howeworksUrl) {
					res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
					res.write(createLessonsTable(lessonsArray));
					res.end();
					return;
				}

				if (req.url.length > howeworksUrl.length) {
					
					let splitedUrl = req.url.split('/');
					requiredId = splitedUrl[splitedUrl.length - 1];

					let requiredLesson = lessonsArray.find(lesson => {
						return requiredId === lesson.id;
					});

					if (requiredLesson) {

						if (req.method === 'DELETE') {
							const filteredLessons = lessonsArray.filter(lesson => {
								return requiredId !== lesson.id;
							});
							fs.writeFile("homeworks.json", JSON.stringify(filteredLessons), () => {
								res.writeHead(200);
								res.end();
								return;
							})
						}

						res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
						res.write(JSON.stringify(requiredLesson));
					} else {
						res.writeHead(400);
						res.write('Wrong URL!!!!');
					}
					res.end();
				}
			});
		}
	}).resume();
}

const server = http.createServer(requestListener);
server.listen(PORT);

