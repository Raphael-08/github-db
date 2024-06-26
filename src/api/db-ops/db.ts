import ora from "ora"
import path from "path"
import z from "zod"
import { write, read, update } from "../api"
import { logger } from "@/cli/utils/logger"

interface SchemaField {
    field: string;
    fieldType: string;
}

const types = {
    "number": [z.number(), Number],
    "string": [z.string(), String]
}


export async function createdb(names: string[]) {
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

export async function createCol(db: string, col: string, schema: SchemaField[]) {
    const tablePath = path.join(db, col + ".json")
    const tableMetaDataPath = path.join(db, "metadata", col + ".json")

    const finalData = JSON.stringify(schema, null, 2)
    const error = await write(tablePath, "[]", "col-write")
    if (error) {
        ora(`${logger.error(`collection already exists with name ${logger.warning(col)} in ${logger.warning(db)}`)}`).fail()
    }
    else {
        await write(tableMetaDataPath, finalData, "col-data-write")
        ora(`collection created with name ${logger.info(col)} in ${logger.info(db)}`).succeed()
    }
}

export async function insert(db: string, col: string, data) {

    const validatedData = await validate(db,col,data)
    const tablePath = path.join(db, col + ".json")
    const table = JSON.parse(await read(tablePath))
    table.push(validatedData)
    await update(tablePath, JSON.stringify(table), "insert-write")
}

function createType(metadata: SchemaField[]) {
    const reducedMD = {}
    metadata.forEach(field => {
        reducedMD[field.field] = field.fieldType;
    });
    return reducedMD
}

async function validate(db: string, col: string, data) {

    const metaDataPath = path.join(db, "metadata", col + ".json")
    const metaData = await read(metaDataPath)
    const fields = JSON.parse(metaData)
    const type = createType(fields)
    Object.keys(data).forEach(key => {
        data[key] = types[type[key]][1](data[key])
    });
    const schemaObject = Object.fromEntries(
        fields.map((field) => [field.field, types[field.fieldType][0]])
    )
    const schema = z.object(schemaObject);
    const validatedData = schema.parse(data)
    return validatedData
}