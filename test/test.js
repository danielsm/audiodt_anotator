const Application = require("spectron").Application;
const electronPath = require("electron");
const path = require("path");

let app;

beforeAll(() => {
  app = new Application({
    path: electronPath,

    args: [path.join(__dirname, "../")]
  });
  return app.start();
}, 15000);

afterAll(function () {
  if (app && app.isRunning()) {
    return app.stop();
  }
});

test("should launch app", async () => {
  const isVisible = await app.browserWindow.isVisible();
  expect(isVisible).toBe(true);
});

test("Displays App window", async function () {
  const count = await app.client.getWindowCount();
  expect(count).toBe(1);
});
