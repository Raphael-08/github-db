#! /usr/bin/env node
import { init } from "./commands/init.js";
import { packageJSON } from "./utils/package-json.js";
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
  program.parse();
})();