import * as ssdp from "node-ssdp";
import { VenstarAPI } from "./venstarApi";

export async function findDevices(): Promise<{
  uri: string;
  exampleDisplayName: string;
  exampleUniqueId: string;
}> {
  const client = new ssdp.Client({});

  await client.search("urn:venstar-com:service:VenstarAPI:7.00");
  return new Promise(async (resolve, reject) => {
    client.on("response", async function inResponse(headers, _, rinfo) {
      console.log("Found thermostat: ", rinfo.address);

      const API = new VenstarAPI("http://" + rinfo.address);
      const exampleDisplayName = (await API.getInfo()).name;

      resolve({
        uri: `http://${rinfo.address}`,
        exampleDisplayName,
        exampleUniqueId: headers.USN || "",
      });
    });
  });
}
