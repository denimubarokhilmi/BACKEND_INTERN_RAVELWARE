import * as service from "../../service/service.js";
import helper from "../../helper.js";

export const getDashboardData = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { month, year } = req.query;

    const validationError = helper.validateQueryParams(month, year);
    if (validationError) {
      return res.status(validationError.status).json({
        status: "ERROR",
        message: validationError.message,
      });
    }

    const result = await service.getEnergyData(panelId, month, year);

    if (!result) {
      return res.status(404).json({
        status: "ERROR",
        message: `Data tidak ditemukan untuk panel '${panelId}'${month ? ` pada ${month} ${year}` : ""}.`,
      });
    }

    res.json({
      status: "OK",
      message: "Success fetch data",
      data: { ...result },
    });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: error.message });
  }
};
