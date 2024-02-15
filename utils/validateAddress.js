const axios = require("axios");

const validateCity = async (data) => {
  const city = data?.city?.toLowerCase();
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${city}&format=json`
    );
    const data = response.data;

    if (data.length > 0) {
      return { success: true, data: { lat: data[0].lat, lon: data[0].lon } };
    } else {
      return { success: false, data: "None" };
    }
  } catch (error) {
    console.error("Error validating city:", error);
    return error;
  }
};

module.exports = { validateCity };
