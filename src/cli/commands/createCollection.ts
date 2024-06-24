import { write } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";
import path from "path";

interface SchemaField {
    field: string;
    fieldType: string;
}

type ParserResult = [string, string[], SchemaField[]];

export const createCollection = new Command()
    .name("createCollection")
    .description("creates a collection")
    .argument("[db]", "the database to create the collection in")
    .argument("[table...]", "the database to create the collection in")
    .action(async (db, str) => {
        const [colName,columns,schema] = await parser(str.join(' '))

        if (!db.length) {
            ora(logger.error("pls provide a database to create collection")).fail()
            process.exit()
        }
        await create(db, colName, columns, schema)
    })

async function parser(str: string): Promise<ParserResult> {

    let columns: string[] = []
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
        columns.push(propertyName)
        schema.push(field)
    })
    return [colName,columns,schema]
}

async function create(db: string, name: string, columns: string[], schema: SchemaField[]) {
    const tablePath = path.join(db, name + ".json")
    const tableDataPath = path.join(db, name + "-data.json")

    const tableData = []
    const data = {
        schema: schema,
        columns: columns
    }

    tableData.push(data)
    const finalData = JSON.stringify(tableData,null,2)
    const error = await write(tablePath, "[]", "col-write")
    if (error) {
        ora(`${logger.error(`collection already exists with name ${logger.warning(name)} in ${logger.warning(db)}`)}`).fail()
    }
    else {
        await write(tableDataPath,finalData,"col-data-write")
        ora(`collection created with name ${logger.info(name)} in ${logger.info(db)}`).succeed()
    }
}