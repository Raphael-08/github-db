import { getTable } from "@/api/api";
import { logger } from "../utils/logger";
import { Command } from "commander";
import Table from 'cli-table3';
import ora from "ora";

export const showTable = new Command()
  .name("showTable")
  .description("shows collection in a table format")
  .argument("[db]", "name of the database")
  .argument("[colName]", "name of the collection")
  .action(async (db, colName) => {

    if (!db.length) {
      ora(logger.error("pls provide a database to show table")).fail();
      process.exit();
    }
    if (!colName.length) {
      ora(logger.error("pls provide a collection to show table")).fail();
      process.exit();
    }
    try {
      if (!db || !colName) {
        ora(
          logger.error("pls provide a database and a collection to show table")
        ).fail();
        return;
      }
      const table = await getTable(db, colName);
      ora(logger.success("table data displayed below")).succeed();
      const tableOutput = new Table({
        head: Object.keys(table[0])
      });
      
      for (const data of table) {
        tableOutput.push(Object.values(data));
      }
  
      console.log(tableOutput.toString());
    } catch (error) {
      ora(logger.error(`failed to show table: ${error.message}`)).fail();
    }
  });
