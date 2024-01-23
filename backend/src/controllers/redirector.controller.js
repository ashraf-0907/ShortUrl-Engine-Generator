import { ErrorMessages } from "../utils/errorMessage.js";
import { ShortUrl } from "../models/shortUrl.model.js";

const redirector = async (req, res) => {
  const urlId = req.params.urlId;

  if (urlId.length === 0)
    return res.status(502).json({
      success: false,
      message: ErrorMessages.INVALID_PARAMETER,
    });

  const currentDate = new Date();

  try {
    const result = await ShortUrl.findOneAndUpdate(
      { _id: urlId },
      {
        $inc: { clickCount: 1 },
        $push: { time: currentDate },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).send("URL not found");
    }

    const redirectUrl = result.global_url;
    return res.status(302).redirect(`${redirectUrl}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export { redirector };
