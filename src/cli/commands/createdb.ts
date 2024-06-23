import { write } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";
import path from "path";
import { z } from "zod";

const createdbOptionsSchema = z.object({
    dbs: z.array(z.string())
});

export const createdb = new Command()
    .name("createdb")
    .description("creates a database")
    .argument("[names...]", "the components to add")
    .action(async (names) => {
        const options = createdbOptionsSchema.parse({ dbs: names })
        if (!options.dbs.length) {
            ora(logger.error("pls provide a name for data base")).fail()
            process.exit()
        }
        await create(options.dbs)
    })

async function create(names: string[]) {
    for (const element of names) {
        const dbPath = path.join(element, ".gitkeep")
        const error = await write(dbPath, "", "dbwrite")
        if (error) {
            ora(`${logger.error(`database already present with name ${logger.warning(element)}`)}`).fail()
        }
        else {
            ora(`database created with name ${logger.info(element)}`).succeed()
        }
    }
}