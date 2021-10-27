/**
 * A new type of upgrade where we take the files from cwp-template-aws and copy them into required locations.
 * Old files are always backed up.
 */
const { prettierFormat, yarnUp } = require("../utils");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const cliPackageJson = require("@webiny/cli/package.json");

const targetVersion = cliPackageJson.version;

const checkFiles = files => {
    for (const initialFile of files) {
        const file = createFullFile(initialFile);
        if (!fs.existsSync(file)) {
            /**
             * We throw error because if any of the files does not exist, it should not go any further.
             */
            throw new Error(`There is no file "${file}".`);
        }
    }
};

const createBackupFileName = file => {
    const ext = `.${file.split(".").pop()}`;

    const now = Math.floor(Date.now() / 1000);

    const backup = file.replace(new RegExp(`${ext}$`), `.${now}${ext}`);

    const backupFile = createFullFile(backup);
    if (!fs.existsSync(backupFile)) {
        return backup;
    }
    throw new Error(`Backup file "${backupFile}" already exists.`);
};

const createFullFile = file => {
    return path.join(process.cwd(), file);
};
/**
 *
 * @param context {CliContext}
 * @param initialTargets {{source: string, destination: string}[]}
 */
const copyFiles = (context, initialTargets) => {
    context.info("Copying files...");
    /**
     * First check if source and target files exist and create a backup file name.
     * @type {{source: string, destination: string, backup: string}[]}
     */
    const targets = [];
    for (const target of initialTargets) {
        /**
         *
         */
        checkFiles([target.source, target.destination]);
        let backup;
        try {
            backup = createBackupFileName(target.destination);
        } catch (ex) {
            context.error(ex.message);
            process.exit(1);
        }

        targets.push({
            source: target.source,
            destination: target.destination,
            backup
        });
    }
    /**
     * Then:
     * - copy new files to their destinations
     */
    const files = [];
    context.info("Copying new files...");
    for (const target of targets) {
        try {
            fs.copyFileSync(createFullFile(target.source), createFullFile(target.destination));
            context.info(`Copying new file "${target.source}" to "${target.destination}".`);
            files.push({
                destination: target.destination,
                backup: target.backup
            });
        } catch (ex) {
            context.error(`Could not copy new file "${target.source}" to "${target.destination}".`);
            for (const file of files) {
                context.info(`Restoring backup file "${file.backup}" to "${file.destination}".`);
                fs.copyFileSync(createFullFile(file.backup), createFullFile(file.destination));
                fs.unlinkSync(createFullFile(file.backup));
            }
            process.exit(1);
        }
    }
    context.info("File copying complete!");
};

/**
 * @param context {CliContext}
 * @param targets {{source: string, destination: string}[]}
 */
const copyFolders = (context, targets) => {
    context.info(`Copy folders...`);

    for (const target of targets) {
        fsExtra.copySync(target.source, target.destination);
    }
};

/**
 *
 * @param context {CliContext}
 * @param initialTargets {{source: string, destination: string}[]}
 */
const assignPackageVersions = (context, initialTargets) => {
    const targets = initialTargets
        .filter(target => target.destination.match(/package\.json$/) !== null)
        .map(target => target.destination);
    if (targets.length === 0) {
        return;
    }
    context.info("Assigning proper package versions...");
    for (const target of targets) {
        const file = path.join(process.cwd(), target);
        try {
            const json = JSON.parse(fs.readFileSync(file).toString());
            /**
             *
             * @type {{}}
             */
            json.dependencies = Object.keys(json.dependencies).reduce((dependencies, key) => {
                if (key.match(/^@webiny\//) === null) {
                    dependencies[key] = json.dependencies[key];
                    return dependencies;
                } else if (json.dependencies[key] === "latest") {
                    dependencies[key] = `${targetVersion}`;
                } else {
                    dependencies[key] = json.dependencies[key];
                }

                return dependencies;
            }, {});
            /**
             *
             */
            if (json.devDependencies) {
                json.devDependencies = Object.keys(json.devDependencies).reduce(
                    (dependencies, key) => {
                        if (key.match(/^@webiny\//) === null) {
                            dependencies[key] = json.devDependencies[key];
                            return dependencies;
                        } else if (json.devDependencies[key] === "latest") {
                            dependencies[key] = `${targetVersion}`;
                        } else {
                            dependencies[key] = json.devDependencies[key];
                        }

                        return dependencies;
                    },
                    {}
                );
            }
            fs.writeFileSync(file, JSON.stringify(json));
        } catch (ex) {
            console.error(ex.message);
        }
    }
};

/**
 * @type {CliUpgradePlugin}
 */
module.exports = {
    name: `upgrade-${targetVersion}`,
    type: "cli-upgrade",
    version: targetVersion,
    /**
     * @param options {CliUpgradePluginOptions}
     * @param context {CliContext}
     * @returns {Promise<boolean>}
     */
    async canUpgrade(options, context) {
        if (context.version === targetVersion) {
            return true;
        } else if (
            context.version.match(
                new RegExp(
                    /**
                     * This is for beta testing.
                     */
                    `^${targetVersion}-`
                )
            )
        ) {
            return true;
        }
        /**
         * We throw error here because it should not go further if version is not good.
         */
        throw new Error(
            `Upgrade must be on Webiny CLI version "${targetVersion}". Current CLI version is "${context.version}".`
        );
    },
    /**
     * @param options {CliUpgradePluginOptions}
     * @param context {CliContext}
     * @returns {Promise<void>}
     */
    async upgrade(options, context) {
        // The following files will be copied over to the user's project.
        // The following files will be copied over to the user's project.
        const targets = [
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/graphql/src/security.ts",
                destination: "api/code/graphql/src/security.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/headlessCMS/src/security.ts",
                destination: "api/code/headlessCMS/src/security.ts"
            },
            // PB Export Combine
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/combine/src/index.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/index.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/combine/src/security.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/security.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/combine/package.json",
                destination: "api/code/pageBuilder/exportPages/combine/package.json"
            },
            // PB Export Process
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/process/src/index.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/index.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/process/src/security.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/security.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/exportPages/process/package.json",
                destination: "api/code/pageBuilder/exportPages/combine/package.json"
            },
            // PB Import Create
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/create/src/index.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/index.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/create/src/security.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/security.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/create/package.json",
                destination: "api/code/pageBuilder/exportPages/combine/package.json"
            },
            // PB Import Process
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/process/src/index.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/index.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/process/src/security.ts",
                destination: "api/code/pageBuilder/exportPages/combine/src/security.ts"
            },
            {
                source: "node_modules/@webiny/cwp-template-aws/template/ddb-es/api/code/pageBuilder/importPages/process/package.json",
                destination: "api/code/pageBuilder/exportPages/combine/package.json"
            }
        ];

        /**
         * Copy new files to their destinations.
         */
        copyFiles(context, targets);

        /**
         * If any package.json destinations, set the versions to current one.
         */
        assignPackageVersions(context, targets);

        /**
         * Finalize upgrade...
         */
        await prettierFormat(
            targets.map(t => t.destination),
            context
        );

        /**
         * Up the versions again and install the packages.
         */
        await yarnUp({
            context,
            targetVersion
        });

        context.info("\n");
        context.info("Existing files were backed up and new ones created.");
        context.info(
            "You must transfer the custom parts of the code from the backed up files if you want everything to work properly."
        );
    }
};
