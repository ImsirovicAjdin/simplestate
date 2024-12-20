// bindElement.js
import { setState } from '../state/setState.js';
import { getState } from '../state/getState.js';
import { watch } from '../state/watch.js';

export const bindElement = ({
    element,         // DOM element to bind
    stateKey,        // Key in state to bind to
    events = {},     // Event handlers that update state
    display         // Function to update UI when state changes
}) => {
    // Set up event listeners that update state
    Object.entries(events).forEach(([eventName, handler]) => {
        element.addEventListener(eventName, (e) => {
            const currentValue = getState(stateKey);
            const newValue = handler(e, currentValue);
            setState(stateKey, newValue);
        });
    });

    // Set up state observer that updates UI
    if (display) {
        watch(stateKey, (value) => display(element, value));
    }
};