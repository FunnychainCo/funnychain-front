//Webpack config
module.exports = {
    module: {
        rules: [
            {
                test: /hammerjs/,
                loader: "bundle-loader",
                options: {
                    lazy: true
                }
            }
        ]
    },
    plugins: [
        {
            name: 'typescript',
            options: {
                useBabel: true,
                useEslint: false, // ignored if `useBabel` is false
                tsLoader: {
                    transpileOnly: true,
                    experimentalWatchApi: false,
                },
                forkTsChecker: {
                    tsconfig: './tsconfig.json',
                    tslint: './tslint.json',
                    watch: './src',
                    typeCheck: true,
                },
            },
        },
    ],
};