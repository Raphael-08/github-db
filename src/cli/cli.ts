#! /usr/bin/env node
import { init } from "./commands/init";
import { createdb } from "./commands/createdb";
import { createCollection } from "./commands/createCollection";
import { insert } from "./commands/insert";
import { transactionStart } from "./commands/startTransaction";
import { succeedTransaction } from "./commands/succeedTransaction";
import { rollBack } from "./commands/rollback";
import { packageJSON } from "./utils/package-json";
import { Command } from "commander";
import { updateMany } from "./commands/update";

(async () => {
  const program = new Command();

  program
    .name(">")
    .description("⚡️ github-db")
    .version(
      packageJSON.version,
      "-v, --version",
      "display the version number"
    );

  program
    .addCommand(init)
    .addCommand(createdb)
    .addCommand(createCollection)
    .addCommand(insert)
    .addCommand(transactionStart)
    .addCommand(succeedTransaction)
    .addCommand(rollBack)
    .addCommand(updateMany);
  program.parse();
})();
