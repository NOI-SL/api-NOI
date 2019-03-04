module.exports.log = function (message, ...contents) {
    const preText = `${new Date().toISOString()} - LOG : `;
    console.log.apply(this, [preText, message, ...contents])
}

module.exports.warn = function (message, ...contents) {
    const preText = `${new Date().toISOString()} - WARN : `;
    console.log.apply(this, [preText, message, ...contents])
}

module.exports.error = function (message, ...contents) {
    const preText = `${new Date().toISOString()} - ERROR : `;
    console.log.apply(this, [preText, message, ...contents])
}