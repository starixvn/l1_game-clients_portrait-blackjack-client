if (process == null) {
    var nodeEnv = "production";

    try {
        if (localStorage && localStorage.getItem("enabledMobxDebug") == "true") {
            nodeEnv = "development";
        }
    } catch {}

    var process = {
        env: {
            NODE_ENV: nodeEnv,
        },
    };
}

if (global == null) {
    var global = globalThis;
}
