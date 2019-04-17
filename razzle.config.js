module.exports = {
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