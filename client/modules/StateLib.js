class ValueObject {
    constructor(value) {
        this._value = value;
        this._callbacks = [];
    }

    get value() {
        return this._value;
    }

    onChange(callback) {
        this._callbacks.push(callback);
    }

    _notifyListeners() {
        this._callbacks.forEach((callback) => {
            callback(this._value);
        });
    }
}

export class State extends ValueObject {
    constructor(_val) {
        super(_val);
        this._dependants = new Set();
    }

    set value(value) {
        this._value = value;
        this._notifyListeners();
        this._dependants.forEach((dependant) => {
            dependant.update();
        });
    }

    get value() {
        return this._value;
    }

    addDependant(dependant) {
        this._dependants.add(dependant);
    }
}

/*
    CompoundState((use) => {
        return use(State);
    })
*/

export class CompoundState extends ValueObject {
    constructor(func) {
        super(null);
        this._value = func((state) => {
            state.addDependant(this);
            return state.value;
        });
        this._func = func;
    }

    get value() {
        return this._value;
    }

    update() {
        this._value = this._func((state) => {
            state.addDependant(this);
            return state.value;
        });
        this._notifyListeners();
    }
} 

//  test

const state = new State(2);
const state2 = new State(4);
const compoundState = new CompoundState((use) => {
     return use(state) * use(state2);
});

compoundState.onChange((value) => {
     console.log(`State changed to ${value}`);
});

state.value = 200;
state2.value = 300

export function hydrateElement(element, builderCallback) {

}

/*
    Example code:
    const state = new State(2);
    const state2 = new State(4);
    const compoundState = new CompoundState((use) => {
        return use(state) * use(state2);
    });

    const element = document.createElement('div');
    hydrateElement(element)()
*/