const fs = require('fs').promises;
const join = require('path').join;


class Collection {

  constructor(collectionName) {
    this.filePath = join(process.cwd(), collectionName + '.json');
  }

  list() {
    return this._readData();
  }

  async findOne(query) {
    const list = await this._readData();
    const listItem = list.find(item => query.id === item.id);
    return listItem;
  }

  async deleteOne(query) {
    const list = await this._readData();
    const filteredList = list.filter(lesson => query.id !== lesson.id);
    return filteredList;
  }

  async _readData() {
    const fileData = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(fileData.toString());
  }
}

module.exports = Collection;