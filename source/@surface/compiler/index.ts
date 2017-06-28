import Webpack       = require("webpack");
import config        = require("./webpack-config");
import UserArguments = require("./user-arguments");

//const userArguments = UserArguments.resolve(process.argv);
export = function (configPath: string, env: string, watch: boolean)
{
    let compiler = Webpack(config(configPath));

    let statOptions: Webpack.Stats.ToStringOptions =
    {
        assets:   true,
        version:  true,
        colors:   true,
        warnings: true,
        errors:   true
    };

    let callback: Webpack.Compiler.Handler =
        (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

    let isWatching = watch;

    console.log(`Starting ${isWatching ? "Watch" : "build"} using ${env} configuration.`);

    if (isWatching)
        compiler.watch({aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
    else
        compiler.run(callback);
}
