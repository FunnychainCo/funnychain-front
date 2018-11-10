module.exports = {
    handleFetch: false,
    importScripts: (['./service-worker-custom.js']),
    staticFileGlobs: [
        'build/static/css/**.css',
        'build/static/js/**.js'
    ],
    stripPrefix: 'build/',
    swFilePath: './build/service-worker.js'
}