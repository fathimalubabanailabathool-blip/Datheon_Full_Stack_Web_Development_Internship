
exports.handler = async function (event) {
    try {
        const city = event.queryStringParameters?.city;
        const type = event.queryStringParameters?.type;

        const API_KEY = process.env.OPENWEATHER_API_KEY;

        if (!API_KEY) {
            throw new Error("Weather API key is not configured.");
        }

        if (!city || !["current", "forecast"].includes(type)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Please provide a city and valid weather type."
                })
            };
        }

        const endpoint =
            type === "current" ? "weather" : "forecast";

        const url = new URL(
            `https://api.openweathermap.org/data/2.5/${endpoint}`
        );

        url.searchParams.set("q", city);
        url.searchParams.set("appid", API_KEY);
        url.searchParams.set("units", "metric");

        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Unable to retrieve weather data."
            })
        };
    }
};
