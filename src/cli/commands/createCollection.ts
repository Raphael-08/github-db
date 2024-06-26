import { createCol } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

interface SchemaField {
    field: string;
    fieldType: string;
}

type ParserResult = [string, SchemaField[]];

export const createCollection = new Command()
    .name("createCollection")
    .description("creates a collection")
    .argument("[db]", "name of the database to create the collection in")
    .argument("[table...]", "name of the collection with columns and datatypes like this \n<collection name>{col1:type,col2:type,col3:type}")
    .action(async (db, str) => {
        const [colName, schema] = await parser(str.join(' '))

        if (!db.length) {
            ora(logger.error("pls provide a database to create collection")).fail()
            process.exit()
        }
        await createCol(db, colName, schema)
    })

async function parser(str: string): Promise<ParserResult> {

    let schema: SchemaField[] = []
    const parts = str.split('{');
    const colName: string = parts[0].trim();
    const propertiesPart = parts[1].replace('}', '').trim();
    const properties = propertiesPart.split(',');
    properties.forEach((property) => {
        const [propertyName, propertyType] = property.split(':').map(part => part.trim());
        const field = {
            field: propertyName,
            fieldType: propertyType
        };
        schema.push(field)
    })
    return [colName, schema]
}