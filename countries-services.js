const https = require("https");

function fetchCountries() {
  return new Promise((resolve, reject) => {
    const apiUrl =
      "https://restcountries.com/v3.1/all?fields=name,capital,flags,currencies,languages,region,subregion,population";

    https
      .get(apiUrl, (apiRes) => {
        let body = "";

        apiRes.on("data", (chunk) => {
          body += chunk;
        });

        apiRes.on("end", () => {
          if (apiRes.statusCode !== 200) {
            reject(
              new Error(`REST Countries API failed with status ${apiRes.statusCode}`)
            );
            return;
          }

          try {
            const countries = JSON.parse(body);
            resolve(countries);
          } catch (error) {
            reject(new Error(`Failed to parse countries payload: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        reject(new Error(`Failed to fetch countries: ${error.message}`));
      });
  });
}

module.exports = { fetchCountries };
