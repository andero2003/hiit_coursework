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
        this._dependants = new Set();
    }

    /**
     * Returns the current value.
     * @returns {*} The current value of the object.
    */
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value; // Update the value
        this._notifyListeners(); // Notify listeners with both old and new values
        this._dependants.forEach((dependant) => {
            dependant.update();
        });
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
    _notifyListeners() {
        this._callbacks.forEach((callback) => {
            callback(this._value);
        });
    }

    /**
     * Adds a dependant to be notified when the state changes.
     * @param {Object} dependant - The dependant object to add.
     */
    addDependant(dependant) {
        this._dependants.add(dependant);
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
        this._dependants.forEach((dependant) => {
            dependant.update();
        });
    }
}

/**
 * Optimised container for reactive rendering of arrays. Only updates the DOM elements that have changed.
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
                            const element = builder(arrayElement, child);
                            child.replaceWith(element);
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

const workouts = new State([]);
const activities = new State([]);

// single source of truth for the entire application state
export const StateManager = {
    currentPage: new State('workouts'),
    sidebarOpen: new State(false),
    workouts: workouts,
    activities: activities,
    workoutsState: new CompoundState((use) => {
        return use(workouts).map((workout) => {
            return {
                ...workout,
                activities: workout.activities.map((activity) => {
                    return {
                        activity: use(activities).find((a) => a.id === activity.activityId),
                        identifier: activity.identifier
                    }
                })
            }
        });
    }),
    history: new State([])
}
