// watch.js
import { getState } from "./getState.js";

export const watch = (key, callback) => {
    const observer = new MutationObserver(() => {
        callback(getState(key));
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
    });

    // Return cleanup function
    return () => observer.disconnect();
};
