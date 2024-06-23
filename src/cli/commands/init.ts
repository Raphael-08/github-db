import { getPackageManager } from "../utils/get-pacman";
import { logger } from "../utils/logger";
import { Command } from "commander";
import { execa } from "execa";
import fs, { existsSync } from "fs";
import ora from "ora";
import path from "path";
import prompts from "prompts";
import { z } from "zod";

const initOptionSchema = z.object({
    cwd: z.string()
})

export const init = new Command()
    .name("init")
    .description("initializes your project for github-db")
    .option(
        "-c, --cwd <cwd>",
        "the working directory. defaults to the current directory.",
        process.cwd()
    )
    .action(async (opts) => {

        const options = initOptionSchema.parse(opts)
        const cwd = path.resolve(options.cwd)

        if (!existsSync(cwd)) {
            logger.error(`The path ${cwd} does not exist. Please try again.`)
            process.exit(1)
        }

        const info = await getEnvInfo()
        const spinner = ora("initializing your project").start()
        await writeToEnv(info,cwd)
        spinner.stop()
        ora("created env file!").succeed()
        spinner.start()
        spinner.text = "installing dependencies..."
        await install(cwd)
        spinner.succeed("done!")
    })

async function getEnvInfo() {
    const options = await prompts([
        {
            type: "text",
            name: "GAT",
            message: `Enter your ${logger.info("github access token")}`,
            initial: "",
        },
        {
            type: "text",
            name: "user",
            message: `Enter your ${logger.info("github username")}`,
            initial: "",
        },
        {
            type: "text",
            name: "repo",
            message: `Enter your ${logger.info("repo name")} you want to use as db`,
            initial: "",
        }
    ])

    const env = `GITHUB_TOKEN="${options.GAT}"\nGITHUB_REPO_OWNER="${options.user}"\nGITHUB_REPO_NAME="${options.repo}"`

    return env
}

async function install(cwd: string) {
    const dependencies = ["@raphael-08/gdb"]
    const packageManager = await getPackageManager(cwd)

    await execa(
        packageManager,
        [packageManager === "npm" ? "install" : "add", ...dependencies],
        {
            cwd,
        }
    );

}
function writeToEnv(info: string, cwd: string) {

    const filePath = path.join(cwd, ".env");
    fs.writeFile(filePath, info, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        }
    });

}