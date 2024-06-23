import chalk from "chalk";

export const logger = {
    info: (text: string) => chalk.cyan(text),
    success: (text: string) => chalk.greenBright(text),
    error: (text: string) => chalk.redBright(text),
    warning: (text: string) => chalk.yellowBright(text),
};