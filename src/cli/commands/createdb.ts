import { createdb as create } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";
import { z } from "zod";

const createdbOptionsSchema = z.object({
    dbs: z.array(z.string())
});

export const createdb = new Command()
    .name("createdb")
    .description("creates a database")
    .argument("[dbs...]", "names of databases")
    .action(async (dbs) => {
        const options = createdbOptionsSchema.parse({ dbs })
        if (!options.dbs.length) {
            ora(logger.error("pls provide a name for data base")).fail()
            process.exit()
        }
        await create(options.dbs)
    })
