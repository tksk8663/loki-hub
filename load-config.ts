export async function loadConfig(path = "./config.json") {
  const configFile = await Deno.readTextFile(path);
  const config = JSON.parse(configFile !== "" ? configFile : "{}");
  return config;
}
