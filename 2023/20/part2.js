const fs = require("fs");
// this is a built in feature of node not a 3rd party library
const { EventEmitter } = require("events");

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => (a * b) / gcd(a, b);

// I essentially took my solution from here:
// https://github.com/rjwut/advent/blob/7e1ebd1f7ab61c59b91409c4a768d190807fee82/src/solutions/2023/day-20.js
// I hope to one day posses the needed skills to solve this myself.

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
  system.reset();

  const highTimes = new Map();
  const inputCount = system.gatekeeper.inputCount;
  system.gatekeeper.addListener("firstHigh", (inputName) => {
    highTimes.set(inputName, system.buttonPresses);
  });
  system.pushButton(() => highTimes.size === inputCount);
  const times = [...highTimes.values()];
  console.log(times.reduce((answer, time) => lcm(answer, time), 1));
});

class Network {
  #modules;
  #button;
  #counts;
  #queue;
  #gatekeeper;

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

    this.#gatekeeper = this.#modules.get("rx").gatekeeper;
  }

  get pulseProduct() {
    return this.#counts.high * this.#counts.low;
  }

  get buttonPresses() {
    return this.#counts.buttonPresses;
  }

  get gatekeeper() {
    return this.#gatekeeper;
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
  #gatekeeper;

  constructor(name) {
    super(name);
  }

  get gatekeeper() {
    return this.#gatekeeper;
  }

  onConnectedInput(mod) {
    this.#gatekeeper = mod;
  }
}
