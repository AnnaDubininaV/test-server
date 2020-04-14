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

  async updateOne(id, newItem) {
    const list = await this._readData();
    const updatedList = list.map(item => item.id === id ? newItem : item);
    return this._writeData(updatedList);
  }

  async insertOne(newItem) {
    newItem.id = Math.random().toString(16).slice(-12) + Math.random().toString(16).slice(-12);   
    const list = await this._readData();    
    list.unshift(newItem);
    return this._writeData(list);
  }

  async _readData() {
    const fileData = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(fileData.toString());
  }

  _writeData(data) {
    return fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');    
  }
}

module.exports = Collection;