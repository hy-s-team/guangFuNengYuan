class Bus {
  list: any;
  constructor() {
    this.list = {};
  }
  $on(name: string, fn: Function) {
    this.list[name] = fn;
  }
  $emit(...data: any[]) {
    const [name, ...info] = data;
    if (this.list[name] === undefined) throw Error("请先挂载在使用");
    return this.list[name](...info);
  }
  $off(name: string) {
    if (this.list[name]) {
      delete this.list[name];
    }
  }
}
const bus = new Bus();

export default bus;
