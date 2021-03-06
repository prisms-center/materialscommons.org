const {api, Task} = require('actionhero');
const {spawn} = require('child_process');
const mcdir = require('@lib/mcdir');

module.exports.MCETLTask = class MCETLTask extends Task {
    constructor() {
        super();
        this.name = 'mcetl';
        this.description = 'Runs mcetl against the spreadsheet';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(etlArgs) {
        let filePath = mcdir.pathToFileId(mcdir.idToUse(etlArgs.file));
        let args = [
            'load',
            '--apikey', etlArgs.apikey,
            '--mcurl', process.env.MCURL,
            '--files', filePath,
            '--project-id', etlArgs.projectId,
            '--experiment-name', etlArgs.experimentName
        ];

        if (etlArgs.hasParent) {
            args.push('--has-parent');
        }

        try {
            api.mc.log.info('Starting mcetl ETL Job', args);
            await spawnEtlJob('../../prodbin/mcetl', args, filePath);
            return true;
        } catch (e) {
            api.mc.log.info(`Failed to process ETL Job ${e} cmd: 'mcetl', args: ${args}`, etlArgs);
            return false;
        }
    }
};

module.exports.TestETLTask = class TestETLTask extends Task {
    constructor() {
        super();
        this.name = 'testETLTask';
        this.description = 'Runs test task';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run() {
        api.mc.log.info('Starting testETLTask');
        return true;
    }
};

module.exports.ProcessSpreadsheetTask = class ProcessSpreadsheetTask extends Task {
    constructor() {
        super();
        this.name = 'processSpreadsheet';
        this.description = 'Performs ETL on a spreadsheet';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(etlArgs) {
        let args = ['--apikey', etlArgs.apikey, '--project', etlArgs.projectId, '--experiment', etlArgs.experimentName, '--spreadsheet', etlArgs.path];
        try {
            api.mc.log.info('Starting pymcetl ETL Job', etlArgs);
            // example: pymcetl --apikey 124e09425cfe4c4287eff056e69c1dd1 --project 23b1eba7-425e-4ee0-a2a2-2ccdf6169920 --experiment E2 --spreadsheet /Pure_Mg_CHESS_MC.xlsx
            await spawnEtlJob('pymcetl', args, etlArgs.path);
            return true;
        } catch (e) {
            api.mc.log.info(`Failed to process ETL Job ${e}, cmd: 'pymcetl', args: ${args}`, etlArgs);
            return false;
        }
    }
};

async function spawnEtlJob(cmd, args, path) {
    return new Promise((resolve, reject) => {
        let child = spawn(cmd, args);
        child.stderr.on('data', data => api.mc.log.info(`Processing spreadsheet ${path}: ${data}`));
        child.stdout.on('data', data => api.mc.log.info(`Processing spreadsheet ${path}: ${data}`));
        child.on('close', exitCode => {
            if (exitCode === 0) {
                api.mc.log.info(`Successfully processed spreadsheet ${path}`);
                resolve();
            } else {
                api.mc.log.info(`Failed while processing spreadsheet ${path}`);
                reject();
            }
        });

        child.on('error', err => {
            api.mc.log.info(`Failed to start processing job for file ${path}: ${err}`);
            reject();
        });
    });
}