#!/usr/bin/env node

import Commands from "../internal/commands.js";
import
{
    toArray,
    toBoolean,
    toEnum,
} from "../internal/common.js";
import createProgram from "./create-program.js";

const program = createProgram()
    .option("--analyzer-default-sizes             <n>", "Module sizes to show in report by default. Should be one of 'stat', 'parsed' or 'gzip'.", toEnum("parsed", "stat", "gzip"))
    .option("--analyzer-exclude-assets            <n>", "Patterns that will be used to match against asset names to exclude them from the report.", toArray)
    .option("--analyzer-host                      <n>", "Host that will be used in server mode to start HTTP server.")
    .option("--analyzer-log-level                 <n>", "Log level. Can be 'info', 'warn', 'error' or 'silent'.", toEnum("info", "warn", "error", "silent"))
    .option("--analyzer-mode                      <n>", "Analyzer Mode. Should be one of server, static, json, disabled.", toEnum("server", "static", "json", "disabled"))
    .option("--analyzer-open                      <n>", "Automatically open report in default browser.", toBoolean)
    .option("--analyzer-port                      <n>", "Port that will be used in server mode to start HTTP server.", x => x == "auto" ? x : Number(x))
    .option("--analyzer-report-filename           <n>", "Path to bundle report file that will be generated in static mode.")
    .option("--analyzer-report-title              <n>", "Content of the HTML title element.")
    .action(x => void Commands.analyze(x));

program.parse(process.argv);