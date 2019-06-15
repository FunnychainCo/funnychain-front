
export function promiseTimeout(promise: Promise<any>, timeoutms: number) {
    // Create a promise that rejects in <ms> milliseconds
    let id;
    let timeout = new Promise((resolve, reject) => {
        id = setTimeout(() => {
            reject('Timed out in '+ timeoutms + 'ms.')
        }, timeoutms);
    });

    promise.then(value => {
        clearTimeout(id);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}