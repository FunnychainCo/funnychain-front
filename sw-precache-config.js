module.exports = {
    importScripts: (['./service-worker-custom.js']),
    staticFileGlobs: ['build/**/*.{js,html,css,png,jpg,gif}'],
    navigateFallback: 'index.html',
    stripPrefix: 'build/',
    minify: true,
    swFilePath: './build/service-worker.js',
    runtimeCaching: [{
        urlPattern: /https?:\/\/fonts.+/,
        handler: 'fastest',
    }, {
        urlPattern: /https?:\/\/images.+/,
        handler: 'fastest',
    }],
}