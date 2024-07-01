import ora from "ora"
import path from "path"
import z from "zod"
import { write, read, update, getLatestCommitSha, deleteFile, updateRef } from "../api"
import { logger } from "@/cli/utils/logger"

interface SchemaField {
    field: string;
    fieldType: string;
}

const types = {
    "number": [z.number(), Number],
    "string": [z.string(), String]
}

type tableType = {
    [key: string]: any;
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

export async function insert(db: string, col: string, data: tableType[], Dtypes: boolean = false) {

    const validatedData = await validate(db, col, data, Dtypes)
    const tablePath = path.join(db, col + ".json")
    const table = JSON.parse(await read(tablePath))
    for (const item of validatedData) {
        table.push(item)
    }
    await update(tablePath, JSON.stringify(table), "insert-write")
}

function createType(metadata: SchemaField[]) {
    const reducedMD = {}
    metadata.forEach(field => {
        reducedMD[field.field] = field.fieldType;
    });
    return reducedMD
}

async function validate(db: string, col: string, data: tableType[], Dtypes: boolean): Promise<tableType[]> {

    const metaDataPath = path.join(db, "metadata", col + ".json")
    const metaData = await read(metaDataPath)
    const fields = JSON.parse(metaData)
    const type = createType(fields)
    const schemaObject = Object.fromEntries(
        fields.map((field) => [field.field, types[field.fieldType][0]])
    )
    const schema = z.object(schemaObject);
    if (Dtypes) {
        for (const item of data) {
            Object.keys(item).forEach(key => {
                item[key] = types[type[key]][1](item[key])
            });
        }
    }
    let validatedData: tableType[]
    for(const item in data){
        const parsedData = schema.parse(item)
        validatedData.push(parsedData)
    }
    return validatedData
}

export async function startTransaction() {
    const savedCommit = await getLatestCommitSha();
    const convertedData = [{ transactionCommit: savedCommit }]
    await write("transaction.json", JSON.stringify(convertedData), "transaction-write")
}

export async function transactionSuccess() {
    await deleteFile("transaction.json")
}

export async function rollBack() {
    let transactionDetails: string
    try {
        transactionDetails = await read("transaction.json")
    }
    catch {
        ora(`${logger.error(`No transaction to rollback`)}`).fail()
        return
    }
    const parsedData = JSON.parse(transactionDetails)
    await updateRef(parsedData[0].transactionCommit)

}

export async function find(db: string, col: string, query) {
    const tablePath = path.join(db, col + ".json")
    const table = JSON.parse(await read(tablePath))
    const filteredData = table.filter((data) => {
        let flag = true
        Object.keys(query).forEach((key) => {
            if (data[key] !== query[key]) {
                flag = false
            }
        })
        return flag
    })
    return filteredData
}