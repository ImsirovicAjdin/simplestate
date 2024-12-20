// increment.js
import { getState } from './getState.js';
import { setState } from './setState.js';

export const setupIncrement = () => {
    document.getElementById('increment')
        .addEventListener('click', () => {
            const count = getState('count');
            setState('count', count + 1);
        });
};
