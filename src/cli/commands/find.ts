import { findAll as findItems } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import Table from "cli-table3";
import ora from "ora";

export const findAll = new Command()
  .name("find")
  .description("Find the query")
  .argument("[db]", "Name of the database")
  .argument("[colName]", "Name of the collection")
  .argument("[data...]", "The query for find in the format [key:value]")
  .action(async (db, colName, data) => {
    const spinner = ora();
    const combinedData = Array.isArray(data) ? data.join(" ") : data;

    if (!combinedData || combinedData.length === 0) {
      spinner.fail("Incorrect syntax. To check syntax, use help(<command>)");
      return;
    }

    try {
      const { query } = await parser(combinedData);

      if (!db || !colName) {
        spinner.fail("Please provide a valid database and collection name");
        return;
      }

      if (Object.keys(query).length === 0) {
        spinner.fail("Query data cannot be empty");
        return;
      }

      const result = await findItems(db, colName, query);
      spinner.succeed("Data retrieved successfully");

      const table = new Table({
        head: Object.keys(result[0] || {}),
        colWidths: Object.keys(result[0] || {}).map(() => 20),
      });

      result.forEach((item) => {
        const values = Object.values(item);
        table.push(values);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail(`Failed to retrieve data: ${error.message}`);
      logger.error(error);
    }
  });

async function parser(str) {
  const regex = /\[([^:\]]+):([^\]]+)\]/g;
  let match;
  const query = {};

  while ((match = regex.exec(str)) !== null) {
    const key = match[1].trim();
    let value = match[2].trim();

    // Try to parse value as an integer
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      value = parseFloat(value);
    } else if (
      value.toLowerCase() === "true" ||
      value.toLowerCase() === "false"
    ) {
      // Handle boolean values
      value = value.toLowerCase() === "true";
    }

    query[key] = value;
  }

  if (Object.keys(query).length === 0) {
    throw new Error("No valid properties found in the string");
  }

  return { query };
}
