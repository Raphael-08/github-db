import { updateMany as updateItems } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import ora from "ora";

export const updateMany = new Command()
  .name("update")
  .description("updates key-value pairs in a collection")
  .argument("<db>", "the database to update the collection in")
  .argument("<colName>", "name of the collection")
  .argument(
    "<query>",
    "the query to find the documents to update in the format [key:value]"
  )
  .argument(
    "<updateData>",
    "the key-value pairs to update in the format [key:value]"
  )
  .action(async (db, colName, query, updateData) => {
    console.log("Arguments received:", { db, colName, query, updateData });

    if (!query || !updateData) {
      ora(
        logger.error("Incorrect syntax. To check syntax, use help(<command>)")
      ).fail();
      return;
    }

    try {
      const queryData = await parser(query);
      const updateDataParsed = await parser(updateData);

      if (!db || !colName) {
        ora(
          logger.error("Please provide a database and a collection to update")
        ).fail();
        return;
      }

      await updateItems(db, colName, queryData, updateDataParsed);
      ora(logger.success("Data updated successfully")).succeed();
    } catch (error) {
      ora(logger.error(`Failed to update data: ${error.message}`)).fail();
    }
  });

async function parser(str: string) {
  const matches = str.match(/\[(.+?):(.+?)\]/g);
  const updates: Record<string, any> = {};

  if (!matches) {
    throw new Error("Invalid input format");
  }

  matches.forEach((match) => {
    const [key, value] = match
      .slice(1, -1)
      .split(":")
      .map((item) => item.trim());

    if (key && value) {
      updates[key] = isNaN(Number(value)) ? value : Number(value);
    } else {
      throw new Error(`Invalid input format for pair: ${match}`);
    }
  });

  return updates;
}
