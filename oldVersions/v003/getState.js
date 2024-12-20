// getState.js
export const getState = (key, prefix = '--state-') => {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`${prefix}${key}`);
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};
