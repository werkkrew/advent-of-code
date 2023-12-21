const fs = require("fs");

const multiply = (terms) =>
  terms.reduce(
    (product, value) => product * value,
    typeof terms[0] === "bigint" ? 1n : 1
  );

const add = (terms) =>
  terms.reduce(
    (sum, value) => sum + value,
    typeof terms[0] === "bigint" ? 0n : 0
  );

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const blocks = data.split("\r\n\r\n").map((block) => block.split("\r\n"));

  const workflows = [];
  blocks[0].forEach((workflow) => {
    let arr = [...workflow.matchAll(/^([a-z]+)\{(.*)\}$/g)];
    let id = arr[0][1];
    let rules = arr[0][2];

    workflow = {
      id: id,
      rules: rules,
    };
    workflows.push(workflow);
  });

  const manager = new WorkflowManager(workflows);
  console.log(manager.computePossibleCombinations());
});

// I wasn't smart enough so I borrowed someone elses solution for now
// https://github.com/rjwut/advent/blob/main/src/solutions/2023/day-19.js

class WorkflowManager {
  #workflows;

  constructor(records) {
    this.#workflows = new Map();
    records.forEach((record) => {
      const workflow = new Workflow(record);
      this.#workflows.set(workflow.id, workflow);
    });
  }

  sortParts(parts) {
    return add(
      parts
        .filter((part) => this.#sortPart(part))
        .map((part) => add(Object.values(part)))
    );
  }

  computePossibleCombinations() {
    const accepted = [];
    const stack = [
      {
        workflowId: "in",
        ranges: new FieldRanges(),
      },
    ];

    do {
      const { workflowId, ranges } = stack.pop();
      const workflow = this.#workflows.get(workflowId);
      workflow.nextStates(ranges).forEach((state) => {
        if (state.workflowId) {
          stack.push(state);
        } else if (state.accepted) {
          accepted.push(state.ranges.combinations);
        }
      });
    } while (stack.length > 0);

    return add(accepted);
  }

  #sortPart(part) {
    let workflowId = "in";

    do {
      const workflow = this.#workflows.get(workflowId);
      const rule = workflow.evaluate(part);

      if (!rule.workflowId) {
        return rule.accepted;
      }

      workflowId = rule.workflowId;
    } while (true);
  }
}

class Workflow {
  #id;
  #rules;

  constructor({ id, rules }) {
    this.#id = id;
    this.#rules = rules.split(",").map((ruleStr) => new Rule(ruleStr));
  }

  get id() {
    return this.#id;
  }

  evaluate(part) {
    return this.#rules.find((rule) => rule.matches(part));
  }

  nextStates(ranges) {
    let nextStates = [];

    for (const rule of this.#rules) {
      let noMatch;
      rule.nextStates(ranges).forEach((state) => {
        if (state.workflowId || "accepted" in state) {
          nextStates.push(state);
        } else {
          noMatch = state.ranges;
        }
      });

      if (!noMatch) {
        break;
      }
      ranges = noMatch;
    }
    return nextStates;
  }
}

class Rule {
  #condition;
  #accepted;
  #workflowId;

  constructor(ruleStr) {
    const parts = ruleStr.split(":");

    if (parts.length === 2) {
      this.#condition = new Condition(parts[0]);
      this.#parseAction(parts[1]);
    } else {
      this.#parseAction(ruleStr);
    }
  }

  get accepted() {
    return this.#accepted;
  }

  get workflowId() {
    return this.#workflowId;
  }

  matches(part) {
    return !this.#condition || this.#condition.evaluate(part);
  }

  nextStates(ranges) {
    const states = [];

    if (this.#condition) {
      const results = this.#condition.updateRanges(ranges);

      if (results?.match) {
        const state = { ranges: results.match };

        if (this.#workflowId) {
          state.workflowId = this.#workflowId;
        } else {
          state.accepted = this.#accepted;
        }

        states.push(state);
      }

      if (results?.noMatch) {
        states.push({ ranges: results.noMatch });
      }
    } else {
      const state = { ranges };

      if (this.#workflowId) {
        state.workflowId = this.#workflowId;
      } else {
        state.accepted = this.#accepted;
      }

      states.push(state);
    }

    return states;
  }

  #parseAction(actionStr) {
    if (actionStr === "A") {
      this.#accepted = true;
    } else if (actionStr === "R") {
      this.#accepted = false;
    } else {
      this.#workflowId = actionStr;
    }
  }
}

class Condition {
  #field;
  #conditionRange;

  constructor(conditionStr) {
    this.#field = conditionStr.charAt(0);
    const value = parseInt(conditionStr.slice(2), 10);
    const lessThan = conditionStr.charAt(1) === "<";
    const min = lessThan ? 1 : value + 1;
    const max = lessThan ? value - 1 : 4000;
    this.#conditionRange = new Range(min, max);
  }

  evaluate(part) {
    return this.#conditionRange.contains(part[this.#field]);
  }

  updateRanges(ranges) {
    return ranges.applyCondition(this.#field, this.#conditionRange);
  }
}

class FieldRanges {
  #ranges;

  constructor(clonedRanges) {
    if (clonedRanges) {
      // Deep copy the ranges
      this.#ranges = new Map(
        [...clonedRanges.entries()].map(([field, range]) => [
          field,
          range.clone(),
        ])
      );
    } else {
      // Set the ranges to 1 - 4000
      this.#ranges = new Map();
      this.#ranges.set("x", new Range(1, 4000));
      this.#ranges.set("m", new Range(1, 4000));
      this.#ranges.set("a", new Range(1, 4000));
      this.#ranges.set("s", new Range(1, 4000));
    }
  }

  get combinations() {
    return multiply([...this.#ranges.values()].map((range) => range.size));
  }

  applyCondition(field, conditionRange) {
    const range = this.#ranges.get(field);
    const intersection = range.intersection(conditionRange);

    if (!intersection) {
      return null;
    }

    const result = { noMatch: null };
    let clone = this.#clone();
    clone.#ranges.set(field, intersection);
    result.match = clone;
    const unmatched = range.subtract(intersection)[0];

    if (unmatched) {
      // There was a non-intersecting part
      clone = this.#clone();
      clone.#ranges.set(field, unmatched);
      result.noMatch = clone;
    }

    return result;
  }

  #clone() {
    return new FieldRanges(this.#ranges);
  }
}

class Range {
  min;
  max;

  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  clone() {
    return new Range(this.min, this.max);
  }

  subrange(offset, length) {
    if (offset < 0 || offset >= this.size) {
      throw new Error(`Subrange offset out of range: ${offset}`);
    }

    const min = this.min + offset;
    const max = min + length - 1;

    if (length < 1 || max > this.max) {
      throw new Error(`Subrange length out of range: ${length}`);
    }

    return new Range(min, max);
  }

  contains(value) {
    return this.min <= value && this.max >= value;
  }

  containsRange(that) {
    return this.contains(that.min) && this.contains(that.max);
  }

  intersects(that) {
    return this.max >= that.min && this.min <= that.max;
  }

  intersection(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      this.contains(that.min) ? that.min : this.min,
      this.contains(that.max) ? that.max : this.max
    );
  }

  union(that) {
    if (!this.intersects(that)) {
      return null;
    }

    return new Range(
      Math.min(this.min, that.min),
      Math.max(this.max, that.max)
    );
  }

  subtract(...others) {
    let ranges = [this];
    let next;
    others.forEach((other) => {
      next = [];
      ranges.forEach((range) => {
        const intersection = range.intersection(other);

        if (intersection) {
          if (intersection.min > range.min) {
            next.push(new Range(range.min, intersection.min - 1));
          }

          if (intersection.max < range.max) {
            next.push(new Range(intersection.max + 1, range.max));
          }
        } else {
          next.push(range);
        }
      });
      ranges = next;
    });

    return ranges;
  }

  equals(that) {
    return this.min === that.min && this.max === that.max;
  }

  get size() {
    return this.max - this.min + 1;
  }

  toArray() {
    return [this.min, this.max];
  }

  toString() {
    return `[${this.min},${this.max}]`;
  }
}
