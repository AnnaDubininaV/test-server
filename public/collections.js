const fs = require('fs').promises;
const join = require('path').join;


class Collection {

  constructor(collectionName) {
    this.filePath = join(process.cwd(), collectionName + '.json');
  }

  list() {
    return this._readData();
  }

  findOne(query) {
    return this._readData()
      .then(lessonsList => lessonsList.find(lesson => query.id === lesson.id))
  }

  deleteOne(query) {
    return this._readData()
      .then(lessonsList => {
        return lessonsList.filter(lesson => query.id !== lesson.id);
      })
  }

  _readData() {
    return fs.readFile(this.filePath, 'utf-8')
      .then(fileData => JSON.parse(fileData.toString()));
  }
}

module.exports = Collection;