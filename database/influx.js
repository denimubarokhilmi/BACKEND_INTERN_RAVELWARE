import { InfluxDB, Point } from "@influxdata/influxdb-client";
const clientInflux = new InfluxDB({
  url: process.env.URL_INFLUX,
  token: process.env.TOKEN_INFLUX,
});

const queryApi = clientInflux.getQueryApi(process.env.INFLUX_ORG);
const writeApi = clientInflux.getWriteApi(
  process.env.INFLUX_ORG,
  process.env.INFLUX_BUCKET,
);

export default {
  queryApi,
  writeApi,
};
