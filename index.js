const http = require('http');
const fs = require('fs').promises;
const readFileSync = require('fs').readFileSync;
const { parse } = require('querystring');
const nStatic = require('node-static');
const Collection = require('./public/collections.js');
const Mustache = require('mustache');

const PORT = process.env.PORT || 5000;

const fileServer = new nStatic.Server('./public');
const collection = new Collection('homeworks');


const templates = {
  list: readFileSync('./templates/list.html', 'utf-8'),
  homework: readFileSync('./templates/homework.html', 'utf-8'),
};

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
    result = result + `<button ">chendge</button>`;
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
      send(lessonsList, { "Content-Type": "text/html; charset=utf-8" }, Mustache.render(templates.list, { rows: lessonsList }));
      return;
    }

    if (req.url.startsWith('/homeworks/')) {
      let requiredId = req.url.substring('/homeworks/'.length);
      const lesson = await collection.findOne({ id: requiredId });
      console.log(req.method + ' ----' + req.url);

      if (req.method === 'DELETE') {
        const filteredLessons = await collection.deleteOne({ id: requiredId });
        await fs.writeFile('homeworks.json', JSON.stringify(filteredLessons));
        send();
        return;
      }

      if (req.method === 'GET') {
        if (req.url === '/homeworks/new') {
          send(true, {}, Mustache.render(templates.homework, { hw: lesson }));
          return;
        }
        send(lesson, { "Content-Type": "text/html; charset=utf-8" }, Mustache.render(templates.homework, { hw: lesson }));
        return;
      }

      if (req.method === 'POST') {

        let body = '';
        req.on('data', data => {
          body = body + data.toString('utf8');
        });

        if (requiredId === 'new') {
          req.on('end', async () => {
            const updatedData = parse(body);
            await collection.insertOne(updatedData);
            res.writeHead(302, { Location: '/homeworks' });
            res.end();
          });
          return;
        }

        req.on('end', async () => {
          const updatedData = parse(body);
          const updatedBody = Object.assign({}, lesson, updatedData);
          await collection.updateOne(lesson.id, updatedBody);
          res.writeHead(302, { Location: '/homeworks' });
          res.end();
        });
        return;
      }
    }
  }
}

const server = http.createServer(requestListener);
server.listen(PORT);
