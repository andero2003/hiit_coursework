// Yes I made this entire framework just for this coursework. 

/**
 * A base class for value objects that store state and notify listeners about changes.
 */
class ValueObject {
    /**
     * Constructs a new ValueObject instance with an initial value.
     * @param {*} value - The initial value of the object.
    */
    constructor(value) {
        this._value = value;
        this._callbacks = [];
    }

    /**
     * Returns the current value.
     * @returns {*} The current value of the object.
    */
    get value() {
        return this._value;
    }

    /**
     * Registers a callback to be called when the value changes.
     * @param {Function} callback - The callback function to register.
     * @returns {Function} A disposal function to unregister the provided callback.
    */
    onChange(callback) {
        this._callbacks.push(callback);
        return () => {
            this._callbacks = this._callbacks.filter((cb) => cb !== callback);
        };
    }

    /**
     * Notifies all registered listeners about a change in value.
     * @private
     */
    _notifyListeners(oldJSON) {
        this._callbacks.forEach((callback) => {
            callback(this._value);
        });
    }

    /**
     * Disposes of the object and unregisters all listeners.
     */
    dispose() {
        this._callbacks = [];
    }
}

/**
 * Extends ValueObject to manage state with additional dependency tracking.
*/
export class State extends ValueObject {
    /**
     * Constructs a new State instance with an initial value.
     * @param {*} value - The initial value of the state.
    */
    constructor(value) {
        super(value);
        this._dependants = new Set();
    }

    /**
     * Sets a new value for the state and notifies listeners and dependants.
     * @param {*} value - The new value to set.
    */
    set value(value) {
        this._updateValue(value);
    }

    _updateValue(newValue) {
        this._value = newValue; // Update the value
        this._notifyListeners(); // Notify listeners with both old and new values
        this._dependants.forEach((dependant) => {
            dependant.update();
        });
    }

    get value() {
        return this._value;
    }

    /**
     * Adds a dependant to be notified when the state changes.
     * @param {Object} dependant - The dependant object to add.
     */
    addDependant(dependant) {
        this._dependants.add(dependant);
    }
}

/**
 * Extends ValueObject to represent a state that is derived from other states, updating automatically when its dependencies change.
 */
export class CompoundState extends ValueObject {
    /**
     * Constructs a new CompoundState instance with a function defining its value based on other states.
     * @param {Function} func - A function that returns the value of the compound state based on other states.
     * Has a single parameter called `use` that registers dependencies and returns their values.
     * 
     * Example usage:
    * 
    * ```javascript
    * const firstName = new State('Jane');
    * const lastName = new State('Doe');
    * 
    * const fullName = new CompoundState((use) => use(firstName) + ' ' + use(lastName));
    * ```
    */
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

    /**
     * Recalculates the value of the compound state and notifies listeners.
     */
    update() {
        this._value = this._func((state) => {
            state.addDependant(this);
            return state.value;
        });
        this._notifyListeners();
    }
}

/*
    array = State([{id: 1, name: 'Jane'}, {id: 2, name: 'John'}])

*/
/**
 * Registers a callback to be called when the value of a state changes.
 * `builder` takes the current array element as its parameter and returns a DOM element.
 * `queryPredicate` takes the current DOM element and the current array element and returns a boolean whether they reference the same object.
 * @param {State<[]>} arrayState 
 * @param {Element} grid 
 * @param {Function} builder 
 * @param {Function} queryPredicate 
 * @returns {Function} A disposal function to unregister the provided callback.
 */
export function ReactiveContainer(arrayState, grid, builder, queryPredicate) {
    let oldState = JSON.parse(JSON.stringify([]));

    const update = (newArray) => {
        const newState = JSON.parse(JSON.stringify(newArray));
        // Add or update elements
        newArray.forEach((arrayElement) => {
            const oldElement = oldState.find(item => item.id === arrayElement.id);
            if (!oldElement) {
                const element = builder(arrayElement);
                grid.appendChild(element);
            } else {
                for (const child of grid.children) {
                    if (queryPredicate(child, arrayElement)) {
                        // Update the element if necessary
                        if (JSON.stringify(oldElement) !== JSON.stringify(arrayElement)) {
                            builder(arrayElement, child);
                        }
                        break;
                    }
                }
            }
        });

        // Remove elements
        Array.from(grid.children).forEach(child => {
            if (!newArray.find(arrayElement => queryPredicate(child, arrayElement))) {
                child.remove();
            }
        });

        oldState = newState;
    };

    update(arrayState.value);
    return arrayState.onChange(update);
}

export const StateManager = {
    currentPage: new State('home'),
    sidebarOpen: new State(false),
    workouts: new State([]),
    activities: new State([]),
}

// const arr = new State([
//     { id: 1, name: 'Jane' },
//     { id: 2, name: 'John' },
//     { id: 3, name: 'Doe' },
// ]);
// StateForEach(arr, (element, index) => {
//     console.log('Changed', element, ' index ', index);
// });

// arr.value = [
//     { id: 1, name: 'Jane' },
//     { id: 2, name: 'John' },
//     { id: 3, name: 'Doe' },
//     { id: 4, name: 'Doe' },
// ];

// arr.value = [
//     { id: 1, name: 'Jane' },
//     { id: 3, name: 'Doe' },
//     { id: 4, name: 'Doe' },
// ];