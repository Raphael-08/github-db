import { createCol } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

interface SchemaField {
  field: string;
  fieldType: string;
}

export const createCollection = new Command()
  .name("createCollection")
  .description("creates a collection")
  .argument("[db]", "name of the database to create the collection in")
  .argument("[colName]", "name of the collection")
  .argument(
    "[data...]",
    "datatypes like this \n<collection name>[col1:type,col2:type,col3:type]"
  )
  .action(async (db, colName, data) => {
    if (!data.length) {
      ora(
        logger.error("incorrect syntax to check syntax do help(<command>)")
      ).fail();
      process.exit();
    }
    const combinedData = Array.isArray(data) ? data.join(" ") : data;
    const schema = await parser(combinedData);
    if (!db.length) {
      ora(logger.error("pls provide a database to create collection")).fail();
      process.exit();
    }
    if (!colName.length) {
      ora(logger.error("pls provide a collection to create")).fail();
      process.exit();
    }
    await createCol(db, colName, schema);
  });

async function parser(str: string): Promise<SchemaField[]> {
  let schema: SchemaField[] = [];
  const regex = /\[\s*([^}]*)\s*\]/;
  const match = str.match(regex);
  let propertiesPart;
  if (match) {
    propertiesPart = match[1];
  } else {
    ora(logger.error(`Input format is incorrect.`)).fail();
    ora(
      `you can check input format using ${logger.info(
        "npx @raphael-08/gdb@latest help <command>"
      )}`
    ).info();
    process.exit(0);
  }
  const properties = propertiesPart.split(",");
  properties.forEach((property) => {
    const [propertyName, propertyType] = property
      .split(":")
      .map((part) => part.trim());
    const field = {
      field: propertyName,
      fieldType: propertyType,
    };
    schema.push(field);
  });
  return schema;
}
