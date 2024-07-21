import { deleteMany as deleteItems } from "@/api/api";
import { validate } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

export const deleteMany = new Command()
  .name("delete")
  .description("Delete key-value pairs in a collection")
  .argument("<db>", "The database to delete the collection from")
  .argument("<colName> ", "Name of the collection")
  .argument(
    "[data...]",
    "The query to find the documents to delete in the format [key:value]"
  )
  .action(async (db, colName, data) => {
    const combinedData = Array.isArray(data) ? data.join(" ") : data;

    if (combinedData.length === 0) {
      ora().fail(
        logger.error("Incorrect syntax. To check syntax, use help(<command>)")
      );
      return;
    }
    try {
      const deleteData = await parser(combinedData);
      const validatedDeleteData = await validate(db, colName, [deleteData], true, true);
      if (!db || !colName) {
        ora().fail(
          logger.error("Please provide a valid database and collection name")
        );
        return;
      }
      if (Object.keys(deleteData).length === 0) {
        ora().fail(logger.error("Query or delete data cannot be empty"));
        return;
      }
      await deleteItems(db, colName, validatedDeleteData);
      ora(logger.success("Data deleted successfully")).succeed();
    } catch (error) {
      ora(logger.error(`failed to delete data: ${error.message}`)).fail();
    }
  });

async function parser(str: string) {
  const matches = str.match(/\[([^:\]]+):([^\]]+)\]/g);
  if (!matches) {
    throw new Error("No valid properties found in the string");
  }
  const deleteData: Record<string, number | string> = {};

  matches.forEach((match) => {
    const [propertyName, propertyValue] = match
      .slice(1, -1)
      .split(":")
      .map((part) => part.trim());

    if (propertyName && propertyValue) {
      {
        deleteData[propertyName] = propertyValue;
      }
    }
  });
  return deleteData;
}
