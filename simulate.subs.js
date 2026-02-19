import { Point } from "@influxdata/influxdb-client";
import influx from "./database/influx.js";
import mqtt from "mqtt";

const mqtt_client = mqtt.connect("mqtt://broker.hivemq.com");

mqtt_client.on("connect", () => {
  mqtt_client.subscribe("DATA/PM/deni/#");
  console.log("MQTT connected, subscribed to DATA/PM/deni/#");
});

mqtt_client.on("message", (topic, message) => {
  try {
    const dataString = message.toString("utf8");
    const jsonData = JSON.parse(dataString);

    const ampere = jsonData.data.i.pop();
    const voltage = jsonData.data.v.pop();
    const panel_id = topic.split("/").pop();

    console.log(
      `[${panel_id}] kw=${jsonData.data.kw} kwh=${jsonData.data.kwh}`,
    );

    const point = new Point("power_consumption")
      .tag("pmCode", panel_id)
      .floatField("kw", parseFloat(jsonData.data.kw))
      .floatField("ampere", parseFloat(ampere))
      .floatField("voltage", parseFloat(voltage))
      .floatField("kwh", parseFloat(jsonData.data.kwh));

    influx.writeApi.writePoint(point);
    influx.writeApi.flush();
  } catch (e) {
    console.log("message is not valid:", message.toString(), e.message);
  }
});
