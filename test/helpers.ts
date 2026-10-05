import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';

export type TestApp = INestApplication<App>;

// A list as it appears in a JSON response (dates are serialized as strings)
export interface ListJson {
  listId: number;
  title: string;
  createdAt: string;
  itemCount: number;
}

// An item as it appears in a JSON response (dates are serialized as strings)
export interface ItemJson {
  itemId: number;
  name: string;
  createdAt: string;
  pickedUpAt: string | null;
}

/**
 * Create and start an app configured like the real one.
 *
 * Each app has its own in-memory store, so calling this in a `beforeEach`
 * means tests can't affect each other.
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: TestApp = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

/**
 * Setup helper: creates a list through the API.
 *
 * Tests of `POST /lists` itself send the request explicitly, since the
 * request is what they check.
 */
export async function createList(
  app: TestApp,
  title: string,
): Promise<ListJson> {
  const response = await request(app.getHttpServer())
    .post('/api/lists')
    .send({ title })
    .expect(201);
  return response.body as ListJson;
}

/**
 * Setup helper: marks an item as picked up through the API.
 *
 * Tests of `PATCH /lists/:listId/items/:itemId` itself send the request
 * explicitly.
 */
export async function pickUpItem(
  app: TestApp,
  listId: number,
  itemId: number,
): Promise<ItemJson> {
  const response = await request(app.getHttpServer())
    .patch(`/api/lists/${listId}/items/${itemId}`)
    .send({ pickedUp: true })
    .expect(200);
  return response.body as ItemJson;
}

/**
 * Setup helper: creates an item in a list through the API.
 *
 * Tests of `POST /lists/:listId/items` itself send the request explicitly.
 */
export async function createItem(
  app: TestApp,
  listId: number,
  name: string,
): Promise<ItemJson> {
  const response = await request(app.getHttpServer())
    .post(`/api/lists/${listId}/items`)
    .send({ name })
    .expect(201);
  return response.body as ItemJson;
}
