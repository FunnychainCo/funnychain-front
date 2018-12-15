module.exports = {
    importScripts: (['./service-worker-custom.js']),
    staticFileGlobs: ['build/**/*.{html,png,jpg,gif}','build/static/**/*.{js,html,css,png,jpg,gif}'],
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