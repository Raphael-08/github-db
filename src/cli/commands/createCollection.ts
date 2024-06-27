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
    const regex = /^(\w+)\s*\{(.+)\}$/;
    const match = str.match(regex);
    let colName, propertiesPart
    if (match) {
        colName = match[1];
        propertiesPart = match[2];
    } else {
        ora(logger.error(`Input format is incorrect.`)).fail(); 
        ora(`you can check input format using ${logger.info('npx @raphael-08/gdb@latest help <command>')}`).info();
        process.exit(0);
    }
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