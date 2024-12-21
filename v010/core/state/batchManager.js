// core/state/batchManager.js

const batchQueue = new Map(); // Map of targets to their pending updates
let isFlushScheduled = false;

export const batchManager = {
    queue(target, propertyName, value) {
        if (!batchQueue.has(target)) {
            batchQueue.set(target, new Map());
        }
        batchQueue.get(target).set(propertyName, value);
        scheduleFlush();
    },

    // Allow immediate updates when needed
    flushTarget(target) {
        if (batchQueue.has(target)) {
            const updates = batchQueue.get(target);
            updates.forEach((value, prop) => {
                target.style.setProperty(prop, value);
            });
            batchQueue.delete(target);
        }
    },

    // For testing and cleanup
    clear() {
        batchQueue.clear();
        isFlushScheduled = false;
    }
};

function scheduleFlush() {
    if (!isFlushScheduled) {
        isFlushScheduled = true;
        requestAnimationFrame(() => {
            batchQueue.forEach((updates, target) => {
                updates.forEach((value, prop) => {
                    target.style.setProperty(prop, value);
                });
            });
            batchQueue.clear();
            isFlushScheduled = false;
        });
    }
}
