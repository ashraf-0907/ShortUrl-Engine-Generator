import { ErrorMessages } from "../utils/errorMessage.js";
import { ShortUrl } from "../models/shortUrl.model.js";
import { urlCreator } from "../utils/urlCreator.js";
import fs from "fs/promises";

const createUrl = async (req, res) => {
  const { global_url, phoneNumbers } = req.body;

  // Check if global_url and phoneNumbers are provided
  if (
    !global_url ||
    !phoneNumbers ||
    !Array.isArray(phoneNumbers) ||
    phoneNumbers.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: ErrorMessages.INVALID_REQUEST,
    });
  }

  console.log(global_url, phoneNumbers);
  const array = [];

  try {
    await Promise.all(
      phoneNumbers.map(async (user_pno) => {
        // Check if user_pno is provided
        if (!user_pno) {
          console.error(`Error: ${ErrorMessages.USER_PNO_REQUIRED}`);
          return;
        }

        const existUrl = await ShortUrl.findOneAndUpdate(
          {
            $and: [{ global_url }, { user_pno }],
          },
          {
            $set: {},
            $setOnInsert: {
              user_pno: user_pno,
              global_url: global_url,
            },
          },
          {
            upsert: true,
            new: true, // Return the modified document instead of the original one
          }
        );

        // Check if existUrl is available
        if (!existUrl) {
          console.error(
            `Error: URL not found for global_url: ${global_url} and user_pno: ${user_pno}`
          );
          return;
        }

        console.log(existUrl);
        const createdUrl = urlCreator(existUrl._id);
        array.push({ user_pno, createdUrl });
      })
    );

    // Create a CSV file
    const csvData = array
      .map((item) => `${item.user_pno},${item.createdUrl}`)
      .join("\n");
    await fs.writeFile("public/output.csv", "user_pno,createdUrl\n" + csvData);

    // Send the CSV file as a response
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=output.csv");

    // Send the CSV file
    res.status(200).sendFile("output.csv", { root: "./public" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export { createUrl };
