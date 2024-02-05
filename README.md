******Weather Shopper with Playwright******

This project utilizes Playwright to automate the interaction with the Weather Shopper web application. The automated tests in Playwright are written in TypeScript.

**Prerequisites**

Make sure you have the following tools installed on your machine:

Docker
>sudo apt install docker.io

Node.js
>sudo apt install nodejs
>
>sudo apt install npm

**Getting Started**

Follow these steps to set up and run the automated tests:

**Clone the Repository**

>bash
>
>Copy code
>
>git clone https://github.com/your-username/WeatherShopper.git

**Navigate to the Project Directory**
>bash
>
>Copy code
>
>cd WeatherShopper

**Build the Docker Image**

>bash
>Copy code
>docker build -t weather-shopper .

**Run the Docker Container**

>bash
>
>Copy code
>
>docker run --rm weather-shopper

This command will execute the Playwright tests inside the Docker container.

**Additional Information**

The Playwright tests are defined in the tests directory.
The Playwright configuration is set in the playwright.config.ts file.
The TypeScript source code is in the src directory, and the compiled JavaScript code is generated in the dist directory.
Feel free to modify the tests or extend the functionality based on your requirements.

**Troubleshooting**

If you encounter any issues, check the Dockerfile, package.json, and Playwright configuration for correctness.
Ensure you have an internet connection during the Docker build process, as it needs to download dependencies.

**Contributors**

Thomas Kolm

**License**

This project is licensed under the ISC License.
