const fs = require("fs");
// this is a built in feature of node not a 3rd party library
const { EventEmitter } = require("events");

const regexp = /^(?<type>[%&])?(?<id>[\w]+) -> (?<outputs>.*)$/gm;

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const matches = [...data.matchAll(regexp)];

  const modules = [];
  matches.forEach((module) => {
    modules.push({
      type: module.groups.type,
      id: module.groups.id,
      outputs: module.groups.outputs,
    });
  });

  const system = new Network(modules);

  system.pushButton(() => system.buttonPresses === 1000);
  console.log(system.pulseProduct);
});

class Network {
  #modules;
  #button;
  #counts;
  #queue;

  constructor(input) {
    this.#modules = new Map();
    this.#parse(input);
    this.reset();
  }

  reset() {
    this.#queue = [];
    this.#counts = { buttonPresses: 0, low: 0, high: 0 };
    this.#modules.forEach((module) => module.reset());
  }

  #parse(input) {
    const connections = new Map();

    input.forEach(({ type, id, outputs }) => {
      let module;
      if (type == "%") {
        module = new FlipFlopModule(id);
      } else if (type == "&") {
        module = new ConjunctionModule(id);
      } else {
        module = new BroadcastModule();
      }

      module.addListener("pulse", (high) => {
        this.#queue.push({ sender: module, high });
      });

      this.#modules.set(id, module);
      connections.set(module, outputs.split(", "));
    });

    connections.forEach((outputs, sourceMod) => {
      outputs.forEach((targetId) => {
        let targetMod = this.#modules.get(targetId);

        if (!targetMod) {
          targetMod = new OutputModule();
          this.#modules.set(targetId, targetMod);
        }

        targetMod.onConnectedInput(sourceMod);
        sourceMod.onConnectedOutput(targetMod);
      });
    });

    this.#button = new Module("button");
    const broadcaster = this.#modules.get("broadcaster");
    this.#button.onConnectedOutput(broadcaster);
    this.#modules.set("button", this.#button);
  }

  get pulseProduct() {
    return this.#counts.high * this.#counts.low;
  }

  get buttonPresses() {
    return this.#counts.buttonPresses;
  }

  pushButton(until) {
    do {
      this.#counts.buttonPresses++;
      this.#queue.push({ sender: this.#button, high: false });

      do {
        this.#next();
      } while (this.#queue.length);
    } while (!until());
  }

  #next() {
    const { sender, high } = this.#queue.shift();
    this.#counts[high ? "high" : "low"] += sender.outputs.length;
    sender.outputs.forEach((output) => {
      output.onPulseReceived(sender, high);
    });
  }
}

class Module extends EventEmitter {
  #id;
  #outputs;

  constructor(id) {
    super();
    this.#id = id;
    this.#outputs = [];
  }

  get id() {
    return this.#id;
  }

  get outputs() {
    return this.#outputs;
  }

  onConnectedOutput(module) {
    this.#outputs.push(module);
  }

  onConnectedInput(_module) {}

  onPulseReceived(_sender, _high) {}

  reset() {}
}

class FlipFlopModule extends Module {
  #state;

  constructor(name) {
    super(name);
    this.#state = false;
  }

  onPulseReceived(_sender, high) {
    if (!high) {
      this.#state = !this.#state;
      this.emit("pulse", this.#state);
    }
  }

  reset() {
    this.#state = false;
  }
}

class ConjunctionModule extends Module {
  #inputs;

  constructor(name) {
    super(name);
    this.#inputs = new Map();
  }

  get inputCount() {
    return this.#inputs.size;
  }

  onConnectedInput(module) {
    this.#inputs.set(module.id, { lastPulseWasHigh: false, foundCycle: false });
  }

  onPulseReceived(sender, high) {
    const input = this.#inputs.get(sender.id);
    input.lastPulseWasHigh = high;

    if (!input.foundCycle && high) {
      input.foundCycle = true;
      this.emit("firstHigh", sender.id);
    }

    const allHigh = [...this.#inputs.values()].every(
      ({ lastPulseWasHigh }) => lastPulseWasHigh
    );
    this.emit("pulse", !allHigh);
  }

  reset() {
    this.#inputs.forEach((_, id) => {
      this.#inputs.set(id, { lastPulseWasHigh: false, received: null });
    });
  }
}

class BroadcastModule extends Module {
  constructor() {
    super("broadcaster");
  }

  onPulseReceived(_sender, high) {
    this.emit("pulse", high);
  }
}

class OutputModule extends Module {
  constructor(name) {
    super(name);
  }
}
