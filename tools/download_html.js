const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  const page = await browser.newPage();

  await page.goto('https://network.mobile.rakuten.co.jp/campaign/referral', { 
    waitUntil: 'networkidle2',
    timeout: 60000 
  });

  await new Promise(resolve => setTimeout(resolve, 5000));

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = `campaign-referral.html`;
  
  try {
    // Extract main content
    const content = await page.evaluate(() => {
      function filterElement(element) {
        // Skip script and style elements
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
          return '';
        }

        // Skip invisible elements, but only if they're explicitly hidden
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          console.log('Filtered out:', element.tagName, element.className);
          return '';
        }

        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Recursively filter children
        const children = Array.from(clone.children);
        children.forEach(child => {
          const filteredContent = filterElement(child);
          if (filteredContent === '') {
            child.remove();
          }
        });

        // Log what we're keeping
        console.log('Keeping element:', element.tagName, element.className);
        return clone.outerHTML;
      }

      // Get main content
      const mainContent = document.querySelector('main') || document.body;
      if (!mainContent) {
        console.log('No main content found!');
        return document.documentElement.outerHTML;
      }
      console.log('Starting with:', mainContent.tagName);
      return filterElement(mainContent);
    });

    // Add basic HTML structure if content is found
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Filtered Content</title>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    // Write content to file
    await fs.writeFile(outputFile, fullHtml);

    console.log(`✅ Content has been saved to: ${outputFile}`);

  } catch (error) {
    console.error('Error during extraction:', error);
    await fs.appendFile(outputFile, `\nError occurred: ${error.message}\n`);
  }

  await browser.close();
})().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});
