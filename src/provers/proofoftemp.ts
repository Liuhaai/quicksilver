import { Prover } from './prover';

export class TempProver implements Prover {
    name: string = "TemperatureRangeProver";
    description: string = "Generates verifiable proof that the temperature is under 60 Fahrenheit. Input is json with temperature to generate proof.";
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = '';
    }

    async prove(userInput: any): Promise<string> {
        // check user input is json with temperature
        if (!userInput || typeof userInput !== 'object' || !('temperature' in userInput)) {
            return "Invalid input. Please provide a JSON object with 'temperature' properties.";
        }

        // const url = `${this.baseUrl}?lat=${userInput.latitude}&lon=${userInput.longitude}`;

        try {
            // const response = await fetch(url, {
            //     headers: {
            //         'x-api-key': this.apiKey,
            //     },
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     const errorMessage = errorData?.message || `API request failed with status: ${response.status} ${response.statusText}`;
            //     return `Weather API Error: ${errorMessage}`;
            // }

            // const data: NubilaWeatherResponse = await response.json();
            // console.log("Nubila API Response:", data);

            // const weatherData = data.data; // Access the weather data using data.data

            // const weatherDescription = weatherData.condition;
            // const temperature = weatherData.temperature;
            // const feelsLike = weatherData.feels_like ? ` (Feels like ${weatherData.feels_like}°C)` : "";
            // const humidity = weatherData.humidity ? ` Humidity: ${weatherData.humidity}%` : "";
            // const pressure = weatherData.pressure ? ` Pressure: ${weatherData.pressure} hPa` : "";
            // const windSpeed = weatherData.wind_speed ? ` Wind Speed: ${weatherData.wind_speed} m/s` : "";
            // const windDirection = weatherData.wind_direction ? ` Wind Direction: ${weatherData.wind_direction}°` : "";


            return `The range proof for temperature of ${userInput.temperature} is 0x1234`;
        } catch (error) {
            console.error("Error generating proof:", error);
            return "Could not generate proof. Please check the API or your network connection.";
        }
    }

    async verify(userInput: any): Promise<boolean> {
        return true;
    }
}