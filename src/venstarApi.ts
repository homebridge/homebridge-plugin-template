import * as request from "request-promise";

interface getInfoResponse {
  name: string;
  mode: number;
  state: number;
  activestage: number;
  fan: number;
  fanstate: number;
  tempunits: number;
  schedule: number;
  schedulepart: number;
  away: number;
  spacetemp: number;
  heattemp: number;
  cooltemp: number;
  cooltempmin: number;
  cooltempmax: number;
  heattempmin: number;
  heattempmax: number;
  setpointdelta: number;
  availablemodes: number;
}

export class VenstarAPI {
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  public async getInfo(): Promise<getInfoResponse> {
    const test = await request.default.get(`${this.uri}/query/info`).promise();
    return JSON.parse(test);
  }

  public async setControl(data: string) {
    console.log("setting control data: " + data);
    const test = await request.default
      .post(`${this.uri}/control`, {
        body: data,
      })
      .promise();

    console.log("result: " + test);
  }
}
