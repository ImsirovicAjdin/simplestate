// styleTag.js
export const createStyleTag = () => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return style.sheet;
};