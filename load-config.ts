export async function loadConfig(path = "./config.json") {
  try {
    const configFile = await Deno.readTextFile(path);
    const config = JSON.parse(configFile !== "" ? configFile : "{}");
    return config;
  } catch (_e) {
    throw new Error("Config file nothing. [" + path + "]");
  }
}
