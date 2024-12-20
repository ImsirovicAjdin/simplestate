// decrement.js
import { getState } from './getState.js';
import { setState } from './setState.js';

export const setupDecrement = () => {
    document.getElementById('decrement')
        .addEventListener('click', () => {
            const count = getState('count');
            setState('count', count - 1);
        });
};