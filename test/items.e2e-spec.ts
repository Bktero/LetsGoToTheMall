import request from 'supertest';
import {
  createItem,
  createList,
  createTestApp,
  type ListJson,
  pickUpItem,
  type TestApp,
} from './helpers.js';

describe('Items (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await app.close();
  });

  describe('POST /lists/:listId/items', () => {
    it('creates an item, not picked up yet, and returns it', async () => {
      const list = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .post(`/api/lists/${list.listId}/items`)
        .send({ name: 'Gorgonzola' })
        .expect(201);

      expect(response.body).toEqual({
        itemId: expect.any(Number),
        name: 'Gorgonzola',
        createdAt: expect.any(String),
        pickedUpAt: null,
      });
      expect(new Date(response.body.createdAt).toString()).not.toBe(
        'Invalid Date',
      );
    });

    it('trims leading and trailing whitespaces from the name', async () => {
      const list = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .post(`/api/lists/${list.listId}/items`)
        .send({ name: '  Gorgonzola  ' })
        .expect(201);

      expect(response.body.name).toBe('Gorgonzola');
    });

    it.each([
      { name: '1 character', itemName: 'a' },
      { name: '150 characters', itemName: 'a'.repeat(150) },
    ])('accepts a name of $name', async ({ itemName }) => {
      const list = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .post(`/api/lists/${list.listId}/items`)
        .send({ name: itemName })
        .expect(201);

      expect(response.body.name).toBe(itemName);
    });

    it('gives a different ID to each item of a list', async () => {
      const list = await createList(app, 'Leroy Merlin');

      const first = await createItem(app, list.listId, 'Gorgonzola');
      const second = await createItem(app, list.listId, 'Bread');

      expect(second.itemId).not.toBe(first.itemId);
    });

    it('makes the item retrievable', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      expect(found.body).toEqual(created);
    });

    it('counts the items of each list separately', async () => {
      const target = await createList(app, 'Leroy Merlin');
      const other = await createList(app, 'Pharmacy');

      await createItem(app, target.listId, 'Gorgonzola');
      await createItem(app, target.listId, 'Bread');
      await createItem(app, other.listId, 'Aspirin');

      const targetAfter = await request(app.getHttpServer())
        .get(`/api/lists/${target.listId}`)
        .expect(200);
      const otherAfter = await request(app.getHttpServer())
        .get(`/api/lists/${other.listId}`)
        .expect(200);

      expect((targetAfter.body as ListJson).itemCount).toBe(2);
      expect((otherAfter.body as ListJson).itemCount).toBe(1);
    });

    it.each([
      { name: 'a missing name', body: {} },
      { name: 'an empty name', body: { name: '' } },
      {
        name: 'a whitespace-only name (trimmed to empty before validation)',
        body: { name: '   ' },
      },
      { name: 'a name of 151 characters', body: { name: 'a'.repeat(151) } },
      { name: 'a number as name', body: { name: 123 } },
      { name: 'null as name', body: { name: null } },
      { name: 'an unknown field', body: { name: 'x', foo: 1 } },
    ])('rejects $name with 400', async ({ body }) => {
      const list = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .post(`/api/lists/${list.listId}/items`)
        .send(body)
        .expect(400);
    });

    it('rejects a request without a body with 400', async () => {
      const list = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .post(`/api/lists/${list.listId}/items`)
        .expect(400);
    });

    it('returns 404 when the list does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/lists/9999/items')
        .send({ name: 'Gorgonzola' })
        .expect(404);
    });

    it('returns 400 when the list ID is not an integer', async () => {
      await request(app.getHttpServer())
        .post('/api/lists/abc/items')
        .send({ name: 'Gorgonzola' })
        .expect(400);
    });
  });

  describe('GET /lists/:listId/items', () => {
    it('returns an empty array when the list has no items', async () => {
      const list = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns the items of the list in creation order', async () => {
      const list = await createList(app, 'Leroy Merlin');
      // Not created in alphabetical order, so a sort by name would be noticed
      const first = await createItem(app, list.listId, 'Gorgonzola');
      const second = await createItem(app, list.listId, 'Bread');
      const third = await createItem(app, list.listId, 'Aspirin');

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);

      expect(response.body).toEqual([first, second, third]);
    });

    it('includes the items that have been picked up', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const notPickedUp = await createItem(app, list.listId, 'Gorgonzola');
      const toPickUp = await createItem(app, list.listId, 'Bread');
      const pickedUp = await pickUpItem(app, list.listId, toPickUp.itemId);

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);

      expect(response.body).toEqual([notPickedUp, pickedUp]);
      expect(response.body[1].pickedUpAt).not.toBeNull();
    });

    it('returns only the items of that list', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const otherList = await createList(app, 'Pharmacy');
      const item = await createItem(app, list.listId, 'Gorgonzola');
      const otherItem = await createItem(app, otherList.listId, 'Aspirin');

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);
      const otherResponse = await request(app.getHttpServer())
        .get(`/api/lists/${otherList.listId}/items`)
        .expect(200);

      expect(response.body).toEqual([item]);
      expect(otherResponse.body).toEqual([otherItem]);
    });

    it('returns 404 when the list does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/lists/9999/items')
        .expect(404);
    });

    it('returns 400 when the list ID is not an integer', async () => {
      await request(app.getHttpServer())
        .get('/api/lists/abc/items')
        .expect(400);
    });
  });

  describe('GET /lists/:listId/items/:itemId', () => {
    it('finds an item by ID', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      expect(found.body).toEqual(created);
    });

    it('finds the requested item among several', async () => {
      const list = await createList(app, 'Leroy Merlin');
      await createItem(app, list.listId, 'Gorgonzola');
      const wanted = await createItem(app, list.listId, 'Bread');
      await createItem(app, list.listId, 'Aspirin');

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${wanted.itemId}`)
        .expect(200);

      expect(found.body).toEqual(wanted);
    });

    it('shows when the item was picked up', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');
      const pickedUp = await pickUpItem(app, list.listId, created.itemId);

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      expect(found.body).toEqual(pickedUp);
      expect(found.body.pickedUpAt).not.toBeNull();
    });

    it('does not find an item through another list', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const otherList = await createList(app, 'Pharmacy');
      const item = await createItem(app, list.listId, 'Gorgonzola');

      await request(app.getHttpServer())
        .get(`/api/lists/${otherList.listId}/items/${item.itemId}`)
        .expect(404);
    });

    it('returns 404 when the item does not exist in the list', async () => {
      const list = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/9999`)
        .expect(404);
    });

    it('returns 404 when the list does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/lists/9999/items/1')
        .expect(404);
    });

    it.each([
      { name: 'list', path: '/api/lists/abc/items/1' },
      { name: 'item', path: '/api/lists/1/items/abc' },
    ])('returns 400 when the $name ID is not an integer', async ({ path }) => {
      await request(app.getHttpServer()).get(path).expect(400);
    });
  });

  describe('PATCH /lists/:listId/items/:itemId', () => {
    it('updates the name and returns the updated item', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ name: 'Bread' })
        .expect(200);

      // Everything but the name is unchanged
      expect(response.body).toEqual({ ...created, name: 'Bread' });
    });

    it('persists the change', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');
      await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ name: 'Bread' })
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      expect(found.body).toEqual({ ...created, name: 'Bread' });
    });

    it('trims leading and trailing whitespaces from the name', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ name: '  Bread  ' })
        .expect(200);

      expect(response.body.name).toBe('Bread');
    });

    it.each([
      { name: '1 character', itemName: 'a' },
      { name: '150 characters', itemName: 'a'.repeat(150) },
    ])('accepts a name of $name', async ({ itemName }) => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ name: itemName })
        .expect(200);

      expect(response.body.name).toBe(itemName);
    });

    it('marks the item as picked up', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ pickedUp: true })
        .expect(200);

      expect(response.body).toEqual({
        ...created,
        pickedUpAt: expect.any(String),
      });
      expect(new Date(response.body.pickedUpAt).toString()).not.toBe(
        'Invalid Date',
      );
      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);
      expect(found.body).toEqual(response.body);
    });

    it('marks a picked-up item as not picked up', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');
      await pickUpItem(app, list.listId, created.itemId);

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ pickedUp: false })
        .expect(200);

      expect(response.body).toEqual({ ...created, pickedUpAt: null });
    });

    it('keeps the original timestamp when picking up an item again', async () => {
      // Only fake the clock's Date: faking timers would stall the HTTP requests
      vi.useFakeTimers({ toFake: ['Date'] });

      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      vi.setSystemTime(new Date('2030-01-01T10:00:00.000Z'));
      const first = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ pickedUp: true })
        .expect(200);

      vi.setSystemTime(new Date('2030-01-01T11:00:00.000Z'));
      const second = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ pickedUp: true })
        .expect(200);

      // Checking the first timestamp proves the clock was really faked
      expect(first.body.pickedUpAt).toBe('2030-01-01T10:00:00.000Z');
      expect(second.body.pickedUpAt).toBe('2030-01-01T10:00:00.000Z');
    });

    it('applies the name and the picked-up state together', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send({ name: 'Bread', pickedUp: true })
        .expect(200);

      expect(response.body).toEqual({
        ...created,
        name: 'Bread',
        pickedUpAt: expect.any(String),
      });
    });

    it('only changes the targeted item and keeps the order', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const first = await createItem(app, list.listId, 'Gorgonzola');
      const second = await createItem(app, list.listId, 'Bread');
      const third = await createItem(app, list.listId, 'Aspirin');

      await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${second.itemId}`)
        .send({ name: 'Baguette' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);
      expect(response.body).toEqual([
        first,
        { ...second, name: 'Baguette' },
        third,
      ]);
    });

    it.each([
      { name: 'an empty object', body: {} },
      { name: 'no body', body: undefined },
    ])('leaves the item unchanged when given $name', async ({ body }) => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send(body)
        .expect(200);

      expect(response.body).toEqual(created);
    });

    it.each([
      { name: 'an empty name', body: { name: '' } },
      {
        name: 'a whitespace-only name (trimmed to empty before validation)',
        body: { name: '   ' },
      },
      { name: 'a name of 151 characters', body: { name: 'a'.repeat(151) } },
      { name: 'a number as name', body: { name: 123 } },
      // An omitted field means "keep it", but an explicit null is rejected
      { name: 'null as name', body: { name: null } },
      { name: 'an unknown field', body: { name: 'x', foo: 1 } },
      { name: 'a non-boolean pickedUp', body: { pickedUp: 'yes' } },
      { name: 'null as pickedUp', body: { pickedUp: null } },
    ])('rejects $name with 400', async ({ body }) => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/${created.itemId}`)
        .send(body)
        .expect(400);
    });

    it('returns 404 when the item does not exist in the list', async () => {
      const list = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .patch(`/api/lists/${list.listId}/items/9999`)
        .send({ name: 'Bread' })
        .expect(404);
    });

    it('returns 404 when the list does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/api/lists/9999/items/1')
        .send({ name: 'Bread' })
        .expect(404);
    });

    it('does not modify an item through another list', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const otherList = await createList(app, 'Pharmacy');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      await request(app.getHttpServer())
        .patch(`/api/lists/${otherList.listId}/items/${created.itemId}`)
        .send({ name: 'Bread' })
        .expect(404);

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);
      expect(found.body).toEqual(created);
    });

    it.each([
      { name: 'list', path: '/api/lists/abc/items/1' },
      { name: 'item', path: '/api/lists/1/items/abc' },
    ])('returns 400 when the $name ID is not an integer', async ({ path }) => {
      await request(app.getHttpServer())
        .patch(path)
        .send({ name: 'Bread' })
        .expect(400);
    });
  });

  describe('DELETE /lists/:listId/items/:itemId', () => {
    it('returns the deleted item', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      const response = await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      expect(response.body).toEqual(created);
    });

    it('makes the item unavailable afterwards', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');
      await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(404);
    });

    it('only removes the targeted item and keeps the order', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const first = await createItem(app, list.listId, 'Gorgonzola');
      const second = await createItem(app, list.listId, 'Bread');
      const third = await createItem(app, list.listId, 'Aspirin');

      await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/${second.itemId}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items`)
        .expect(200);
      expect(response.body).toEqual([first, third]);
    });

    it('returns 404 when deleting the same item twice', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const created = await createItem(app, list.listId, 'Gorgonzola');
      await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(404);
    });

    it('decrements the item count of that list only', async () => {
      const target = await createList(app, 'Leroy Merlin');
      const other = await createList(app, 'Pharmacy');
      await createItem(app, target.listId, 'Gorgonzola');
      const toDelete = await createItem(app, target.listId, 'Bread');
      await createItem(app, other.listId, 'Aspirin');

      await request(app.getHttpServer())
        .delete(`/api/lists/${target.listId}/items/${toDelete.itemId}`)
        .expect(200);

      const targetAfter = await request(app.getHttpServer())
        .get(`/api/lists/${target.listId}`)
        .expect(200);
      const otherAfter = await request(app.getHttpServer())
        .get(`/api/lists/${other.listId}`)
        .expect(200);
      expect((targetAfter.body as ListJson).itemCount).toBe(1);
      expect((otherAfter.body as ListJson).itemCount).toBe(1);
    });

    it('does not delete an item through another list', async () => {
      const list = await createList(app, 'Leroy Merlin');
      const otherList = await createList(app, 'Pharmacy');
      const created = await createItem(app, list.listId, 'Gorgonzola');

      await request(app.getHttpServer())
        .delete(`/api/lists/${otherList.listId}/items/${created.itemId}`)
        .expect(404);

      const found = await request(app.getHttpServer())
        .get(`/api/lists/${list.listId}/items/${created.itemId}`)
        .expect(200);
      expect(found.body).toEqual(created);
    });

    it('returns 404 when the item does not exist in the list', async () => {
      const list = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .delete(`/api/lists/${list.listId}/items/9999`)
        .expect(404);
    });

    it('returns 404 when the list does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/api/lists/9999/items/1')
        .expect(404);
    });

    it.each([
      { name: 'list', path: '/api/lists/abc/items/1' },
      { name: 'item', path: '/api/lists/1/items/abc' },
    ])('returns 400 when the $name ID is not an integer', async ({ path }) => {
      await request(app.getHttpServer()).delete(path).expect(400);
    });
  });
});
