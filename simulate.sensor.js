import mqtt from "mqtt";
const client = mqtt.connect("mqtt://broker.hivemq.com");

const panels = ["PANEL_LANTAI_1", "PANEL_LANTAI_2", "PANEL_LANTAI_3"];

const panelState = {};
panels.forEach((panel, idx) => {
  panelState[panel] = {
    kw: 1.2 + idx * 0.1,
    kva: 1.28 + idx * 0.1,
    kwh: 10.1 + idx * 5,
  };
});

setInterval(() => {
  panels.forEach((panel) => {
    const state = panelState[panel];

    const payload = {
      status: "OK",
      data: {
        v: [224.7, 224.7, 0, 149.8],
        i: [0.5, 0.6, 0.5, 0.7],
        kw: parseFloat(state.kw.toFixed(2)),
        kva: parseFloat(state.kva.toFixed(2)),
        kwh: parseFloat(state.kwh.toFixed(2)),
        pf: 0,
        vunbal: 0.009,
        iunbal: 0.009,
        time: new Date().toISOString().replace("T", " ").split(".")[0],
      },
    };

    client.publish(`DATA/PM/deni/${panel}`, JSON.stringify(payload));
    console.log(`Published ${panel}:`, payload.data.kw, payload.data.kwh);

    state.kw += 1;
    state.kva += 1;
    state.kwh += 10;
  });
}, 60000);
