import { insert as insertItems } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

export const insert = new Command()
    .name("insert")
    .description("inserts data into a collection")
    .argument("[db]", "the database to create the collection in")
    .argument("[colName]", "name of the collection")
    .argument("[records...]", "the data to be inserted in the format [key:value,key:value]")
    .action(async (db, colName, records) => {
        if (!records.length) {
            ora(logger.error("incorrect syntax to check syntax do help(<command>)")).fail()
            process.exit()
        }
        const combinedData = Array.isArray(records) ? records.join(' ') : records;
        const data = await parser(combinedData)


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

    const cleanedStr = str.match(/\[([^}]*)\]/)
    const properties = cleanedStr[1].split(',');
    const data = {}
    properties.forEach((property) => {
        const [propertyName, propertyValue] = property.split(':').map(part => part.trim());
            data[propertyName]= propertyValue
    })
    return data
}