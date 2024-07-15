import { updateMany as updateItems } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

export const updateMany = new Command()
  .name("update")
  .description("Updates key-value pairs in a collection")
  .argument("<db>", "The database to update the collection in")
  .argument("<colName>", "Name of the collection")
  .argument(
    "[data...]",
    "The query to find the documents to update and the key-value pairs to update in the format [key:value] [key:value]"
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
      const { query, updateData } = await parser(combinedData);

      if (!db || !colName) {
        ora().fail(
          logger.error("Please provide a valid database and collection name")
        );
        return;
      }

      if (
        Object.keys(query).length === 0 ||
        Object.keys(updateData).length === 0
      ) {
        ora().fail(logger.error("Query or update data cannot be empty"));
        return;
      }

      await updateItems(db, colName, query, updateData);
      ora(logger.success("Data updated successfully")).succeed();
    } catch (error) {
      ora(logger.error(`failed to updated data: ${error.message}`)).fail();
    }
  });

async function parser(str: string) {
  const regex = str.match(/\[([^:\]]+):([^\]]+)\]/g);
  if (!regex) {
    throw new Error("No valid properties found in the string");
  }

  const properties = regex.map((prop) => prop.slice(1, -1));

  const query: { [key: string]: string } = {};
  const updateData: { [key: string]: string } = {};

  properties.forEach((property, index) => {
    const [propertyName, propertyValue] = property
      .split(":")
      .map((part) => part.trim());

    if (index === 0) {
      query[propertyName] = propertyValue;
    } else {
      updateData[propertyName] = propertyValue;
    }
  });

  return { query, updateData };
}
