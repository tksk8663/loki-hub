import { loadConfig } from "./load-config.ts";

const log = {
  info: (msg: string) => {
    logOutput("INFO", msg);
  },
  warn: (msg: string) => {
    logOutput("WARNING", msg);
  },
  error: (msg: string) => {
    logOutput("ERROR", msg);
  },
  debug: (msg: string) => {
    logOutput("DEBUG", msg);
  },
};

async function logOutput(level: string, mes: string) {
  const config = await loadConfig();
  if (config.log) {
    let fileName = "";
    if (level === "ERROR" && config.log.error) {
      fileName = config.log.error;
    } else if (level === "WARNING" && config.log.error) {
      fileName = config.log.warn;
    } else if (level === "INFO" && config.log.info) {
      fileName = config.log.info;
    } else if (level === "DEBUG" && config.log.debug) {
      fileName = config.log.debug;
    } else if (config.log.default) {
      fileName = config.log.default;
    }
    if (fileName !== "") {
      Deno.writeTextFile(fileName, `[${level}] ${String(mes)}`, { append: true, create: true });
    } else {
      console.log(`[${level}] ${String(mes)}`);
    }
  } else {
    console.log(`[${level}] ${String(mes)}`);
  }
}
/*
async function fileExist(fileName: string): Promise<boolean> {
  try {
    const file = await Deno.stat(fileName);
    return file.isFile;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
} //*/

export default log;
