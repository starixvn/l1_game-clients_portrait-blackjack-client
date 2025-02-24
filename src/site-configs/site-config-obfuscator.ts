const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const fsPromise = require("fs").promises;

const writeFile = async (fileName: string, content: string) => {
    try {
        await fsPromise.writeFile(fileName, content, { encoding: "utf8", flag: "w" });
        console.log(`Done: ${fileName}`);
    } catch (e) {
        console.log(e);
    }
};

const obfuscate = async (fileName: string, content: string, outputDir: string) => {
    try {
        const rawContent = content.replace(/ /g, "").replace(/(\r\n|\n|\r)/gm, "");

        const uglyCode = JavaScriptObfuscator.obfuscate(rawContent, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1,
        }).getObfuscatedCode();

        writeFile(outputDir + fileName.replace("site-configs", "c"), uglyCode.toString());
    } catch (e) {
        console.log(e);
    }
};

const doObfuscationDirectory = async (dirName: string, outputDir: string) => {
    let fileNames = await fsPromise.readdir(dirName);
    fileNames = fileNames.filter((name: string) => name.endsWith(".js"));

    for (const fileName of fileNames) {
        const content = await fsPromise.readFile(dirName + fileName, { encoding: "utf-8" });

        await obfuscate(fileName, content, outputDir);
    }
};

const runObfuscationProcess = async (dirNames: string[]) => {
    for (const dirName of dirNames) {
        try {
            const outputDir = dirName + "obfuscations/";

            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true });
            }

            await fsPromise.mkdir(outputDir);
            await doObfuscationDirectory(dirName, outputDir);
        } catch (ex) {
            console.log(`Dir ${dirName}, ${JSON.stringify(ex)}`);
        }
    }
};

runObfuscationProcess(["./site-configs/L1/", "./site-configs/L2/", "./site-configs/sp_hd/"]);
