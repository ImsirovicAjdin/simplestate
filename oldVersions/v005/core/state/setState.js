// setState.js
export const setState = (key, value, prefix = '--state-') => {
    document.documentElement.style
        .setProperty(`${prefix}${key}`, JSON.stringify(value));
}