import { insert as insertItems } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

export const insert = new Command()
    .name("insert")
    .description("inserts data into a collection")
    .argument("[db]", "the database to create the collection in")
    .argument("[colName]", "the database to create the collection in")
    .argument("[records...]", "the database to create the collection in")
    .action(async (db, colName, records) => {
        if (!records.length) {
            ora(logger.error("incorrect syntax to check systax do help(<command>)")).fail()
            process.exit()
        }
        const data = await parser(records.join(' '))

        if (!db.length) {
            ora(logger.error("pls provide a database to insert")).fail()
            process.exit()
        }
        if (!colName.length) {
            ora(logger.error("pls provide a collection to insert")).fail()
            process.exit()
        }

        insertItems(db, colName, data, true)

    })

async function parser(str: string) {

    const cleanedStr = str.match(/\{([^}]*)\}/)
    const properties = cleanedStr[1].split(',');
    const data = {}
    properties.forEach((property) => {
        const [propertyName, propertyValue] = property.split(':').map(part => part.trim());
            data[propertyName]= propertyValue
    })
    return data
}