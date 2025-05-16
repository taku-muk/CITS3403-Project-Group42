import chromedriver from 'chromedriver';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

const CHROME_BINARY      = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROMEDRIVER_PATH  = chromedriver.path;
const BASE_URL           = 'http://127.0.0.1:5000';
const REGISTER_URL       = `${BASE_URL}/register`;
const LOGIN_URL          = `${BASE_URL}/login`;

describe('Full Register → Login E2E Flow', () => {
  let driver;
  // Use the same random user for both register & login
  const testUser     = 'user' + Math.floor(Math.random() * 100000);
  const correctPass  = 'SecurePass1!';
  const wrongPass    = 'WrongPass123';

  beforeAll(async () => {
    const service = new chrome.ServiceBuilder(CHROMEDRIVER_PATH);
    const options = new chrome.Options()
      .setChromeBinaryPath(CHROME_BINARY)
      .addArguments(['--headless=new', '--no-sandbox', '--disable-gpu']);

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeService(service)
      .setChromeOptions(options)
      .build();
  }, 20000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  //
  // ─── REGISTER TESTS ─────────────────────────────────────────
  //

  test('1. Register page loads and title is correct', async () => {
    await driver.get(REGISTER_URL);
    const title = await driver.getTitle();
    expect(title).toBe('Register | CostScope');
  });

  test('2. Register form fields are visible', async () => {
    await driver.get(REGISTER_URL);
    const u = await driver.findElement(By.name('username'));
    const p = await driver.findElement(By.name('password'));
    const c = await driver.findElement(By.name('confirm'));
    const s = await driver.findElement(By.css('input[type="submit"]'));
    expect(u && p && c && s).toBeTruthy();
  });

  test('3. Register fails with empty form (HTML5 required-field validation)', async () => {
    await driver.get(REGISTER_URL);
  
    // Click submit with all fields empty
    const submit = await driver.findElement(By.css('input[type="submit"]'));
    await submit.click();
  
    // Grab the username field (the first required input)
    const username = await driver.findElement(By.name('username'));
  
    // 1) It should be invalid:
    const isValid = await driver.executeScript(
      'return arguments[0].checkValidity();',
      username
    );
    expect(isValid).toBe(false);
  
    // 2) And the browser’s validationMessage should mention “please fill”
    const message = await driver.executeScript(
      'return arguments[0].validationMessage;',
      username
    );
    expect(message.toLowerCase()).toMatch(/please fill/);
  }, 15000);
  
  test('4. Register fails with mismatched passwords', async () => {
    await driver.get(REGISTER_URL);
    await driver.findElement(By.name('username')).sendKeys(testUser);
    await driver.findElement(By.name('password')).sendKeys('abc123');
    await driver.findElement(By.name('confirm')).sendKeys('xyz789');
    await driver.findElement(By.css('input[type="submit"]')).click();

    const flash = await driver.wait(
      until.elementLocated(By.css('.bg-red-500')),
      10000
    );
    const txt = await flash.getText();
    expect(txt.toLowerCase()).toContain('passwords');
  }, 15000);

  test('5. Register succeeds with valid credentials', async () => {
    await driver.get(REGISTER_URL);
    await driver.findElement(By.name('username')).sendKeys(testUser);
    await driver.findElement(By.name('password')).sendKeys(correctPass);
    await driver.findElement(By.name('confirm')).sendKeys(correctPass);
    await driver.findElement(By.css('input[type="submit"]')).click();

    // should redirect to /login
    await driver.wait(until.urlContains('/login'), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/login');
  }, 20000);

  //
  // ─── LOGIN TESTS ────────────────────────────────────────────
  //

  test('6. Login fails with invalid username', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.name('username')).sendKeys('no_such_user');
    await driver.findElement(By.name('password')).sendKeys(correctPass);
    await driver.findElement(By.css('input[type="submit"]')).click();

    const flash = await driver.wait(
      until.elementLocated(By.css('.bg-red-500')),
      10000
    );
    const txt = await flash.getText();
    expect(txt.toLowerCase()).toContain('invalid');
  }, 15000);

  test('7. Login fails with correct username but wrong password', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.name('username')).sendKeys(testUser);
    await driver.findElement(By.name('password')).sendKeys(wrongPass);
    await driver.findElement(By.css('input[type="submit"]')).click();

    const flash = await driver.wait(
      until.elementLocated(By.css('.bg-red-500')),
      10000
    );
    const txt = await flash.getText();
    expect(txt.toLowerCase()).toContain('invalid');
  }, 15000);

  test('8. Login succeeds with correct credentials', async () => {
    await driver.get(LOGIN_URL);
    await driver.findElement(By.name('username')).sendKeys(testUser);
    await driver.findElement(By.name('password')).sendKeys(correctPass);
    await driver.findElement(By.css('input[type="submit"]')).click();

    // should redirect to /upload
    await driver.wait(until.urlContains('/upload'), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/upload');
  }, 15000);
});
