import ora from "ora";
import path from "path";
import z from "zod";
import {
  write,
  read,
  update,
  getLatestCommitSha,
  deleteFile,
  updateRef,
} from "../api";
import { logger } from "@/cli/utils/logger";
import { ErrorHandler } from "../utils/errors";

interface SchemaField {
  field: string;
  fieldType: string;
}

const types = {
  number: [z.number(), Number],
  string: [z.string(), String],
  boolean: [z.boolean(), Boolean],
  date: [z.date(), Date],
  null: [z.null(), null],
  undefined: [z.undefined(), undefined],
};

export type tableType = {
  [key: string]: any;
};

export async function createdb(names: string[]) {
  for (const element of names) {
    const dbPath = path.join(element, ".gitkeep");
    try {
      write(dbPath, "", "db-write");
      ora(`database created with name ${logger.info(element)}`).succeed();
    } catch {
      ora(
        `${logger.error(
          `database already present with name ${logger.warning(element)}`
        )}`
      ).fail();
    }
  }
}

export async function createCol(
  db: string,
  col: string,
  schema: SchemaField[]
) {
  const tablePath = path.join(db, col + ".json");
  const tableMetaDataPath = path.join(db, "metadata", col + ".json");

  const finalData = JSON.stringify(schema, null, 2);
  try {
    await write(tablePath, "[]", "col-write");
    await write(tableMetaDataPath, finalData, "col-data-write");
    ora(
      `collection created with name ${logger.info(col)} in ${logger.info(db)}`
    ).succeed();
  } catch (error) {
    ora(
      `${logger.error(
        `collection already exists with name ${logger.warning(
          col
        )} in ${logger.warning(db)}`
      )}`
    ).fail();
  }
}

export async function insert(
  db: string,
  col: string,
  data: tableType[],
  Dtypes: boolean = false
) {
  const validatedData = await validate(db, col, data, Dtypes);
  const tablePath = path.join(db, col + ".json");
  let table: tableType[] = [];
  try {
    const jsonData = await read(tablePath);
    if (jsonData.length < 2) {
      throw ErrorHandler("UserMessedWithDBError", "User messed with db");
    }
    table = JSON.parse(jsonData);
  } catch (error) {
    if (error.name === "UserMessedWithDBError") {
      ora(
        `${logger.error(
          `${logger.warning(
            error.name
          )}: user messed collection with name ${logger.warning(
            col
          )} in ${logger.warning(db)}`
        )}`
      ).fail();
      throw ErrorHandler("UnsuccessfulError", "Unsuccesfull");
    }

    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    throw ErrorHandler("UnsuccessfulError", "Unsuccesfull");
  }
  for (const item of validatedData) {
    table.push(item);
  }
  try {
    await update(tablePath, JSON.stringify(table, null, 2), "insert-write");
  } catch {
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
}

function createType(metadata: SchemaField[]) {
  const reducedMD = {};
  metadata.forEach((field) => {
    reducedMD[field.field] = field.fieldType;
  });
  return reducedMD;
}

export async function validate(
  db: string,
  col: string,
  data: tableType[],
  Dtypes: boolean = false
): Promise<tableType[]> {
  const metaDataPath = path.join(db, "metadata", col + ".json");
  let metaData: string;
  try {
    metaData = await read(metaDataPath);
  } catch (error) {
    if (error.name === "HttpError") {
      ora(
        `${logger.error(
          `${logger.warning(
            "MetaDataNotOFoundError"
          )}: collection with name ${logger.warning(
            col
          )} doesn't have metadata in ${logger.warning(db)}`
        )}`
      ).fail();
      return;
    }
  }
  const fields = JSON.parse(metaData);
  const schemaObject = Object.fromEntries(
    fields.map((field: SchemaField) => [field.field, z.optional(types[field.fieldType][0])])
  );
  const schema = z.object(schemaObject);
  if (Dtypes) {
    const type = createType(fields);
    for (const item of data) {
      Object.keys(item).forEach((key) => {
        item[key] = types[type[key]][1](item[key]);
      });
    }
  }
  let validatedData: tableType[] = [];
  for (const item of data) {
    const parsedData = schema.parse(item);
    validatedData.push(parsedData);
  }
  return validatedData;
}

export async function startTransaction() {
  const savedCommit = await getLatestCommitSha();
  const convertedData = [{ transactionCommit: savedCommit }];
  try {
    await write(
      "transaction.json",
      JSON.stringify(convertedData),
      "transaction-write"
    );
  } catch {
    ora(`${logger.error(`Transaction already started`)}`).fail();
  }
}

export async function transactionSuccess() {
  try {
    await deleteFile("transaction.json");
  } catch {
    ora(`${logger.error(`No transaction to succeed`)}`).fail();
    return;
  }
}

export async function rollBack() {
  let transactionDetails: string;
  try {
    transactionDetails = await read("transaction.json");
  } catch {
    ora(`${logger.error(`No transaction to rollback`)}`).fail();
    return;
  }
  const parsedData = JSON.parse(transactionDetails);
  await updateRef(parsedData[0].transactionCommit);
}

export async function findAll(db: string, col: string, query: tableType) {
  const tablePath = path.join(db, col + ".json");
  let table: tableType[] = [];
  try {
    table = JSON.parse(await read(tablePath));
    if (table.length === 0) {
      throw ErrorHandler("EmptyTableError", "Table is empty");
    }
  } catch (error) {
    if (error.name === "EmptyTableError") {
      ora(
        `${logger.error(
          `${logger.warning(error.name)}: collection with name ${logger.warning(
            col
          )} is empty in ${logger.warning(db)}`
        )}`
      ).fail();
      return;
    }
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
  const filteredData = table.filter((data: tableType) => {
    let flag = true;
    Object.keys(query).forEach((key) => {
      if (data[key] !== query[key]) {
        flag = false;
      }
    });
    return flag;
  });
  return filteredData;
}

export async function deleteMany(db: string, col: string, query: tableType) {
  const tablePath = path.join(db, col + ".json");
  let table: tableType[] = [];
  try {
    table = JSON.parse(await read(tablePath));
    if (table.length === 0) {
      throw ErrorHandler("EmptyTableError", "Table is empty");
    }
  } catch (error) {
    if (error.name === "EmptyTableError") {
      ora(
        `${logger.error(
          `${logger.warning(error.name)}: collection with name ${logger.warning(
            col
          )} is empty in ${logger.warning(db)}`
        )}`
      ).fail();
      return;
    }
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
  const filteredData = table.filter((data: tableType) => {
    let flag = true;
    Object.keys(query).forEach((key) => {
      if (data[key] !== query[key]) {
        flag = false;
      }
    });
    return !flag;
  });
  try {
    await update(
      tablePath,
      JSON.stringify(filteredData, null, 2),
      "delete-write"
    );
  } catch {
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
}

export async function updateMany(
  db: string,
  col: string,
  query: tableType,
  updateData: tableType
) {
  const tablePath = path.join(db, col + ".json");
  let table: tableType[] = [];
  try {
    table = JSON.parse(await read(tablePath));
    if (table.length === 0) {
      throw ErrorHandler("EmptyTableError", "Table is empty");
    }
  } catch (error) {
    if (error.name === "EmptyTableError") {
      ora(
        `${logger.error(
          `${logger.warning(error.name)}: collection with name ${logger.warning(
            col
          )} is empty in ${logger.warning(db)}`
        )}`
      ).fail();
      return;
    }
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
  const updatedData = table.map((data: tableType) => {
    let flag = true;
    Object.keys(query).forEach((key) => {
      if (data[key] !== query[key]) {
        flag = false;
      }
    });
    if (flag) {
      Object.keys(updateData).forEach((key) => {
        data[key] = updateData[key];
      });
    }
    return data;
  });
  try {
    await update(
      tablePath,
      JSON.stringify(updatedData, null, 2),
      "update-write"
    );
  } catch {
    ora(
      `${logger.error(
        `unable to update the collection\ncollection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
}

export async function getTable(db: string, col: string) {
  const tablePath = path.join(db, col + ".json");
  let table: tableType[] = [];
  try {
    table = JSON.parse(await read(tablePath));
    if (table.length === 0) {
      throw ErrorHandler("EmptyTableError", "Table is empty");
    }
  } catch (error) {
    if (error.name === "EmptyTableError") {
      ora(
        `${logger.error(
          `${logger.warning(error.name)}: collection with name ${logger.warning(
            col
          )} is empty in ${logger.warning(db)}`
        )}`
      ).fail();
      return;
    }
    ora(
      `${logger.error(
        `collection with name ${logger.warning(
          col
        )} not found in ${logger.warning(db)}`
      )}`
    ).fail();
    return;
  }
  return table;
}
