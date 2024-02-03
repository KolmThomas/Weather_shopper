import { test, expect } from '@playwright/test';

test('WeatherShopperFull', async ({ page }) => {
    // Open Page and check the Title
    await page.goto('https://weathershopper.pythonanywhere.com/');
    await expect(page).toHaveTitle('Current Temperature');

    // Get the Element which includes the temperature and check if it is not empty
    const TemperatureElement = await page.$('#weather');
    if (!TemperatureElement) {
        console.error('Element wasn\'t found');
        await page.close();
        return;
    }

    // Get the Temperature Number and cut off the °C
    const Temperature = await TemperatureElement.innerText();
    const BaseTemperature = parseInt(Temperature.replace('°C', '').trim());

    // Array for the two bought articles + price for step 3
    let Articles: [string, number][] = [
        ['Test', 999],
        ['Test2', 999]
    ];
    let numericPrice = 0;
    console.log('Temperature:', BaseTemperature);

    // When Temperature is below 19 °C it presses the "Buy moisturizer" Button and if it is above 34 C° it presses the "Buy Sunscreens" Button. Else it doesn't do anything but logs the Temperature.
    switch(true) {
        case BaseTemperature < 19:
            // Open Page and wait for the loading
            await page.click('button:has-text("Buy moisturizers")');
            await page.waitForLoadState('load');
            await page.waitForSelector('div.text-center.col-4');

            // Create an array of all Products
            const MoisturizerProducts = await page.$$('div.text-center.col-4');

            // Loop to identify the lowest Cost Aloe and Almond
            for (const product of MoisturizerProducts) {
              const productName = await product.$eval('.font-weight-bold', (el) => el.textContent?.trim());
              const productPriceText = await product.$eval('p:has-text("rice: ")', (el) => el.textContent?.trim());
              
              // Check if not empty and correct
              if (productName && productPriceText && productPriceText.startsWith('Price: ')) {
                  // Remove the string in the Price
                  if(productPriceText.startsWith('Price: Rs. ')){
                    numericPrice = parseFloat(productPriceText.replace('Price: Rs.', '').trim());
                  } else {
                    numericPrice = parseFloat(productPriceText.replace('Price: ', '').trim());
                  } 
  
                  // Check for Aloe
                  if (productName.includes("Aloe") && !isNaN(numericPrice) && numericPrice < Articles[0][1]) {
                    Articles[0] = [productName, numericPrice];
                  }
  
                  // Check for Almond
                  if (productName.includes("Almond") && !isNaN(numericPrice) && numericPrice < Articles[1][1]) {
                    Articles[1] = [productName, numericPrice];
                  }
              }
            }
            // Check for missing articles
            if(Articles[0][0] == 'Test' || Articles[1][0] == 'Test2') {
              console.error('No Articles with Aloe or Almond were found.');
              process.exitCode = 1;
            }

          break;
        // When the Temperature is higher than 34, sunscreens will be bought
        case BaseTemperature > 34:
            // Open Page and wait for the loading
            await page.click('button:has-text("Buy sunscreens")');
            await page.waitForLoadState('load');
            await page.waitForSelector('div.text-center.col-4');

            // Create an array of all Products
            const SunscreenProducts = await page.$$('div.text-center.col-4');

            // Loop to identify the lowest Cost SPF-50 & -30
            for (const product of SunscreenProducts) {
              const productName = await product.$eval('.font-weight-bold', (el) => el.textContent?.trim());
              const productPriceText = await product.$eval('p:has-text("rice: ")', (el) => el.textContent?.trim());
              
              // Check if not empty and correct
              if (productName && productPriceText && productPriceText.startsWith('Price: ')) {
                  // Remove the string in the Price
                  if(productPriceText.startsWith('Price: Rs. ')){
                    numericPrice = parseFloat(productPriceText.replace('Price: Rs.', '').trim());
                  } else {
                    numericPrice = parseFloat(productPriceText.replace('Price: ', '').trim());
                  }  
                  // Check for SPF-50
                  if (productName.includes("SPF-50") && !isNaN(numericPrice) && numericPrice < Articles[0][1]) {
                    Articles[0] = [productName, numericPrice];
                  }
  
                  // Check for SPF-30
                  if (productName.includes("SPF-30") && !isNaN(numericPrice) && numericPrice < Articles[1][1]) {
                    Articles[1] = [productName, numericPrice];
                  }
              }
            }
            // Check for missing articles
            if(Articles[0][0] == 'Test' || Articles[1][0] == 'Test2') {
              console.error('No Articles with SPF-50 or SPF-30 were found.');
              process.exitCode = 1;
            }
            break;

            // When the temp is over 19 and under 34
            default:
            console.log('No Button needed to be pushed. The temperature is:', BaseTemperature);
            await page.close();
            return;
    }

    // Add the two Articles and give the cart time to update
    await page.click(`button[onclick^="addToCart('${Articles[0][0]}'"]`);
    await page.waitForTimeout(1000); // Wartezeit in Millisekunden
    await page.click(`button[onclick^="addToCart('${Articles[1][0]}'"]`);
    await page.waitForTimeout(1000);

    // Articles are found and added to Cart. Now it will be clicked and part 3 begins
    await page.click('button:has-text("Cart - 2 item(s)")');
    await page.waitForTimeout(1000);

    // Get the total price and check it with the page
    const PriceTotal = Articles[0][1] + Articles[1][1];

    // Throws error if price doesn't match
    try {
      const FinalPrice = await page.innerText(`div:has-text("${PriceTotal}")`);
      console.log("Price Total is correct");
    } catch (error) {
      console.error('The total cost is not correct');
      process.exitCode = 1;
    }
    
    await page.click('button:has-text("Pay with Card")');

    // Waiting for the popup
    const iframe = await page.waitForSelector('iframe[name="stripe_checkout_app"]');
    const frame = iframe ? await iframe.contentFrame() : null;
    
    // Make sure the popup is loaded
    if (!frame) {
        console.log('Error while loading the iframe.');
        await page.close();
        return;
    }
    
    await frame.waitForLoadState('load');
    
    // Aktionen innerhalb des <iframe> durchführen
    await frame.type('input[placeholder="Email"]', 'Tester@test.com');
    await frame.type('input[placeholder="Card number"]', '378282246310005');
    await frame.type('input[placeholder="MM / YY"]', '01/26');
    await frame.type('input[placeholder="CVC"]', '2468');
    await frame.type('input[placeholder="ZIP Code"], input[placeholder="Postcode"]', '10001');

    await frame.click('button:has-text("Pay")');

    // Checker if payment was successfull
    try {
      const FinishedPayment = await page.innerText('div:has-text("PAYMENT SUCCESS")');
      console.log("Payment was successful");
      await page.close();
    } catch (error) {
      console.error('Payment wasn\'t successful');
      process.exitCode = 1;
    }
});
