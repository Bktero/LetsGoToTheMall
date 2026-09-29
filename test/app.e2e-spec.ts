import request from 'supertest';
import { createTestApp, type TestApp } from './helpers.js';

describe('AppController (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Found. Redirecting to /docs');
  });
});
