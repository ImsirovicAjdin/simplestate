// onChange.js
import { getState } from "./getState.js";

export const onChange = (key, callback) => {
    const observer = new MutationObserver(() => {
        callback(getState(key));
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
    });
};
