import fs from 'fs'

const caches = {};

class Cache {
  constructor(name) {
    this.name = name + '.cache.json';
    this.data = caches[this.name] || this.load();

    process.on('exit', () => this.save);
  }

  get() {
    return this.data;
  }

  set(k, v) {
    this.data[k] = v;
  }

  setter(k, d) {
    return (v)=> this.data[k] = d || v;
  }

  has(k) {
    return !!this.data[k];
  }

  load() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.name)) || {};
    } catch (e) {
      this.data = {};
    }

    return this.data;
  }

  save() {
    fs.writeFileSync(this.name, JSON.stringify(this.data))
  }
}

export default Cache