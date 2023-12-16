import fs from "node:fs/promises";

const dbPathname = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(dbPathname, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        return this.#persist();
      });
  }

  #persist() {
    fs.writeFile(dbPathname, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const taskIndex = this.#database[table].findIndex((task) => task.id === id);

    if (taskIndex !== -1) {
      this.#database[table].splice(taskIndex, 1);
      this.#persist();
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((item) => item.id === id) 
    
    if (rowIndex !== -1) {
      const row = this.#database[table][rowIndex]
     
      this.#database[table][rowIndex] = { id, ...row, ...data}
      this.#persist()
    }
   
  }
}
