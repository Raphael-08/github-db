import { write } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";
import path from "path";
import { z } from "zod";

const createdbOptionsSchema = z.object({
    db: z.string(),
    name: z.string()
});

export const createCollection = new Command()
    .name("createCollection")
    .description("creates a collection")
    .argument("<db>", "the database to create the collection in")
    .argument("<name>", "the name of the collection to create")
    .action(async (db, name) => {
        const options = createdbOptionsSchema.parse({ db, name })
        if (!options.db.length) {
            ora(logger.error("pls provide a database to create collection")).fail()
            process.exit()
        }
        await create(options.db, options.name)
    })

async function create(db: string, name: string) {
    const Path = path.join(db, name+".json")
    const error = await write(Path, "[]", "colwrite")
    if (error) {
        ora(`${logger.error(`collection already exists with name ${logger.warning(name)} in ${logger.warning(db)}`)}`).fail()
    }
    else {
        ora(`collection created with name ${logger.info(name)} in ${logger.info(db)}`).succeed()
    }
}