import { response, responseError } from "../helpers/helpers.js";
import { v4 as uuidv4 } from "uuid";
import mainModels from "../models/Main.js";
import path from "path";

const topUp = async (req, res, next) => {
  try {
    const { user_id, amount, description } = req.body;
    const { image_topup } = req.files;
    const fileName = `${Date.now} - ${uuidv4} - ${image_topup.name}`;
    const dataTopUp = {
      invoice_number: uuidv4(),
      user_id,
      transaction_type: "topup",
      status: "pending",
      amount,
      description,
    };
    await mainModels
      .insertDataTopup(dataTopUp)
      .then(() => {
        console.log("masuk then");
        response(res, "sucess", 200, "sukses masuk then dan insert data")
        image_topup.mv(path.join(__dirname, "/public", fileName), (err) => {
          console.log("masuk fileupload");
          console.log(err);
          err
            ? responseError(
                res,
                "Error upload",
                500,
                "Failed upload image top up",
                err
              )
            : mainModels
                .insertImageTopup(fileName, dataTopUp.invoice_number)
                .then(() => {
                  response(
                    res,
                    "Success",
                    200,
                    "Successfully inserted data topup"
                  );
                })
                .catch((err) => {
                  responseError(
                    res,
                    "Error",
                    500,
                    "Error during upload image",
                    err
                  );
                });
        });
      })
      .catch((err) => {
        responseError(res, "Error", 500, "Error during insert data", err);
      });
  } catch (err) {
    next(err);
  }
};

export default {
  topUp,
};
