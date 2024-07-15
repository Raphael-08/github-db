import { rollBack as rollback } from "@/api/api";
import { Command } from "commander";
import { logger } from "../utils/logger";
import ora from "ora";

export const rollBack = new Command()
  .name("rollBack")
  .description("succeeds a transaction")
  .action(async () => {
    await rollback();
    ora(
      logger.success(
        "If there is a transaction in progress .it will get rolled back "
      )
    ).succeed();
  });
