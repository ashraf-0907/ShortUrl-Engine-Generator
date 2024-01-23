import { ErrorMessages } from "../utils/errorMessage.js";
import { ShortUrl } from "../models/shortUrl.model.js";
import { formatDistanceToNow } from "date-fns";

const getAnalytics = async (req, res) => {
  try {
    const { search, searchOption } = req.body;

    // Validate search option
    if (!["user_pno", "global_url"].includes(searchOption)) {
      return res.status(400).json({
        success: false,
        message: ErrorMessages.INVALID_SEARCH_OPTION,
      });
    }

    // Build the search query based on the search option
    const searchQuery = {
      [searchOption]: new RegExp(search, "i"),
    };

    // Define fields based on the searchOption
    let selectFields;
    if (searchOption === "user_pno") {
      selectFields = "global_url clickCount time";
    } else if (searchOption === "global_url") {
      selectFields = "user_pno clickCount time";
    }

    // Query database for analytics data with search
    const analyticsData = await ShortUrl.find(searchQuery)
      .select(selectFields)
      .sort({ time: -1 });

    // Modify the results to include a formatted lastTime
    const modifiedAnalyticsData = analyticsData.map((data) => {
      const lastTime =
        data.time.length > 0
          ? formatLastTime(data.time[data.time.length - 1])
          : "Not Clicked";
      const { time, ...dataWithoutTime } = data._doc;
      return { ...dataWithoutTime, lastTime };
    });

    res.status(200).json({
      success: true,
      data: {
        analytics: modifiedAnalyticsData,
      },
      message: "Analytics data retrieved successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

const formatLastTime = (lastTime) => {
  const currentDate = new Date();
  const timeDifference = currentDate - new Date(lastTime);

  if (timeDifference < 60 * 1000) {
    return `${Math.floor(timeDifference / 1000)} seconds ago`;
  } else if (timeDifference < 60 * 60 * 1000) {
    return `${Math.floor(timeDifference / (60 * 1000))} minutes ago`;
  } else {
    return formatDistanceToNow(new Date(lastTime), { addSuffix: true });
  }
};

export { getAnalytics };
