import { startTransaction as transaction } from '@/api/api';
import { Command } from 'commander';
import { logger } from "../utils/logger";
import ora from "ora";

export const transactionStart = new Command()
    .name('transactionStart')
    .description('Start a new transaction')
    .action(async () => {
        await transaction()
        ora(logger.success("transaction started successfully")).succeed()
    });
