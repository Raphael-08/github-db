import { transactionSuccess as transaction } from "@/api/api";
import { Command } from "commander";
import { logger } from "../utils/logger";
import ora from "ora";

export const succeedTransaction = new Command()
  .name("succeedTransaction")
  .description("succeeds a transaction")
  .action(async () => {
    await transaction();
    ora(logger.success("transaction started successfully")).succeed();
  });
