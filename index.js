const http = require('http');
const fs = require('fs').promises;
const nStatic = require('node-static');
const Collection = require('./public/collections.js');

const PORT = process.env.PORT || 5000;

const fileServer = new nStatic.Server('./public');
const collection = new Collection('homeworks');

function createLessonsTable(arr) {
  let result = '';
  result = result + '<html><body><table>';
  result = result + '<tr>';
  result = result + '<td>Number</td>';
  result = result + '<td>Lessons title</td>';
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

const requestListener = async (req, res) => {

  const send = (data, header, showMessage) => {
    if (data) {
      res.writeHead(200, header);
      if (showMessage) res.write(showMessage);
    } else {
      res.writeHead(404);
    }
    res.end();
  }

  if (!req.url.startsWith('/homeworks')) {
    fileServer.serve(req, res);
    return;
  }

  if (req.url.startsWith('/homeworks')) {

    if (req.url === '/homeworks') {
      const lessonsList = await collection.list();
      send(lessonsList, { "Content-Type": "text/html; charset=utf-8" }, createLessonsTable(lessonsList));
      return;
    }

    if (req.url.startsWith('/homeworks/')) {
      let requiredId = req.url.substring('/homeworks/'.length);

      if (req.method === 'DELETE') {
        const filteredLessons = await collection.deleteOne({ id: requiredId });
        await fs.writeFile('homeworks.json', JSON.stringify(filteredLessons));
        send();
        return;
      }

      const lesson = await collection.findOne({ id: requiredId });
      send(lesson, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify(lesson));
      return;

    }
  }
}

const server = http.createServer(requestListener);
server.listen(PORT);
