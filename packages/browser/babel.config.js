const developmentEnvironments = ['development', 'test'];

const developmentPlugins = [];

const productionPlugins = [];

module.exports = (api) => {
    const isDevelopment = api.env(developmentEnvironments);

    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    electron: '24.3',
                    node: '16.18',
                },
                // useBuiltIns: 'usage',
                // corejs: { version: '3.23.4', proposals: true },
            },
        ],
        [
            '@babel/preset-react',
            { development: isDevelopment, runtime: 'automatic' },
        ],
    ];
    const plugins = [
        ...(isDevelopment ? developmentPlugins : productionPlugins),
    ];

    return {
        compact: false,
        presets,
        plugins,
    };
};
