#! /usr/bin/env node
import { init } from "./commands/init";
import { createdb } from "./commands/createdb";
import { createCollection } from "./commands/createCollection"
import { insert } from "./commands/insert";
import { packageJSON } from "./utils/package-json";
import { Command } from "commander";

(async () => {
  const program = new Command();

  program
    .name(">")
    .description("⚡️ raphael-08/ui.")
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
  program.parse();
})();