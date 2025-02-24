import { DevTools, Tolgee } from "@tolgee/web";
import fs from "fs";

interface NamespaceConfig {
    list: string[];
    specificKeys: {
        [key: string]: string[];
    };
    shouldFilterKeys: (ns: string) => boolean;
    getSpecificKeys: (ns: string) => string[];
}

interface TolgeeConfig {
    defaultLanguage: string;
    apiKey: string;
    apiUrl: string;
    projectId: string;
    defaultNs: string;
}

interface Config {
    files: {
        languageFolder: string;
        remoteLocalizationPath?: string;
    };
    languages: string[];
    namespaces: NamespaceConfig;
    remoteKeys: {
        [key: string]: string;
    };
    tolgeeConfig: TolgeeConfig;
}

// Configuration constants
const CONFIG: Config = {
    files: {
        languageFolder: "./src/assets/resources/i18n/",
        remoteLocalizationPath: "./src/remote/localization",
    },
    languages: ["en", "id", "th", "vi", "zh_cn", "zh_tw"],
    namespaces: {
        list: ["Common", "SicBo"],
        specificKeys: {},
        shouldFilterKeys: (ns: string) => Object.keys(CONFIG.namespaces.specificKeys).includes(ns),
        getSpecificKeys: (ns: string) => CONFIG.namespaces.specificKeys[ns as keyof typeof CONFIG.namespaces.specificKeys] || [],
    },
    remoteKeys: {
        game_name: "gameNames",
        game_icon_name: "lobbyNames",
    },
    tolgeeConfig: {
        defaultLanguage: "en",
        apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
        apiUrl: "https://tolgee.sabagame.com/",
        projectId: "5",
        defaultNs: "messages",
    },
};

class TolgeeGenerator {
    private tg: any;
    private languages: {
        [languageId: string]: {
            [ns: string]: {
                [key: string]: string;
            };
        };
    } = {};
    private remoteNames: Record<string, Record<string, string>> = {};

    constructor(private config: Config) {
        this.initializeTolgee();
        this.initializeRemoteNames();
    }

    private initializeTolgee(): void {
        this.tg = Tolgee()
            .use(DevTools())
            .init({
                ...this.config.tolgeeConfig,
                availableLanguages: this.config.languages,
                ns: this.config.namespaces.list,
            });
    }

    private initializeRemoteNames(): void {
        this.remoteNames = Object.fromEntries(Object.values(this.config.remoteKeys).map((key) => [key, {}]));
    }

    private writeFile(fileName: string, content: string, extension = "ts"): void {
        fs.writeFileSync(`${fileName}.${extension}`, content, { encoding: "utf8", flag: "w" });
    }

    private processRemoteKeys(key: string, value: string, languageId: string): void {
        Object.entries(this.config.remoteKeys).forEach(([remoteKey, propertyName]) => {
            if (key === remoteKey) {
                this.remoteNames[propertyName][languageId] = value;
            }
        });
    }

    private processNamespaceKeys(record: any, ns: string, languageId: string, filterKeys = false): void {
        if (record.namespace === ns) {
            this.languages[languageId][ns] = {};

            record.data.forEach((value: string, key: string) => {
                const shouldIncludeKey = !filterKeys || (filterKeys && this.config.namespaces.getSpecificKeys(ns).includes(key));

                if (shouldIncludeKey) {
                    this.languages[languageId][ns][key] = value;
                }

                this.processRemoteKeys(key, value, languageId);
            });
        }
    }

    private generateLanguageFile(languageId: string): void {
        const languageScript = `const win = window as any;
export const languages = {0};

if (!win.languages) {
    win.languages = {};
}

win.languages.${languageId} = languages;`;

        this.writeFile(
            this.config.files.languageFolder + languageId,
            languageScript.replace("{0}", JSON.stringify(this.languages[languageId], null, 4))
        );
    }

    private generateIndexFile(): void {
        const indexContent = this.config.languages.map((lang) => `export * as ${lang} from "./${lang}";`).join("\n");
        this.writeFile(this.config.files.languageFolder + "index", indexContent);
    }

    private async processLanguage(languageId: string): Promise<void> {
        await this.tg.changeLanguage(languageId);
        this.languages[languageId] = {};

        const namespacesWithSpecificKeys = this.config.namespaces.list.filter((ns) => this.config.namespaces.shouldFilterKeys(ns));
        const namespacesWithFullKeys = this.config.namespaces.list.filter((ns) => !this.config.namespaces.shouldFilterKeys(ns));

        // Process specific key namespaces
        namespacesWithSpecificKeys.forEach((ns) => {
            this.tg.getAllRecords().forEach((record: any) => {
                this.processNamespaceKeys(record, ns, languageId, true);
            });
        });

        // Process full key namespaces
        namespacesWithFullKeys.forEach((ns) => {
            this.tg.getAllRecords().forEach((record: any) => {
                this.processNamespaceKeys(record, ns, languageId, false);
            });
        });

        this.generateLanguageFile(languageId);
    }

    public async generate(): Promise<void> {
        this.tg.run();

        this.tg.on("initialLoad", async () => {
            for (const languageId of this.config.languages) {
                await this.processLanguage(languageId);
            }

            this.generateIndexFile();
            this.writeFile(
                this.config.files.remoteLocalizationPath || "./src/remote/localization.json",
                JSON.stringify(this.remoteNames, null, 4),
                "json"
            );

            console.log("Generation completed successfully!");
        });
    }
}

// Initialize and run the generator
const generator = new TolgeeGenerator(CONFIG);
generator.generate();
