
const http = require('http');
const fs = require('fs').promises;
const stat = require('node-static');

const PORT = process.env.PORT || 5000;
const file = new stat.Server('./public');

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

	if (!req.url.startsWith('/homeworks')) {
		file.serve(req, res);
		return;
	}	

	if (req.url.startsWith('/homeworks')) {
		const readData = () => {
			return fs.readFile('./homeworks.json', 'utf8')
				.then(fileData => JSON.parse(fileData.toString()))
		};

		if (req.url === '/homeworks') {
			readData().then(lessonsList => {
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.write(createLessonsTable(lessonsList));
				res.end();
				return;
			});
		}


		if (req.url.startsWith('/homeworks/')) {
			let requiredId = req.url.substring('/homeworks/'.length);

			if (req.method === 'DELETE') {
				readData()
					.then(lessonsList => {
						return lessonsList.filter(lesson => {
							return requiredId !== lesson.id;
						});
					})
					.then(filteredLessons => {
						fs.writeFile("homeworks.json", JSON.stringify(filteredLessons))
							.then(() => {
								res.writeHead(200);
								res.end();							
							})
					})
						return;
			}

			readData()
				.then(lessonsList => lessonsList.find(lesson => {
					return requiredId === lesson.id;
				})
				)
				.then(lesson => {
					if (!lesson) {
						res.writeHead(404);
						res.end();
						return;
					}
					res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
					res.write(JSON.stringify(lesson));
					res.end();
					return;
				})
		}
	}
};
const server = http.createServer(requestListener);
server.listen(PORT);

