import request from 'supertest';
import {
  createItem,
  createList,
  createTestApp,
  type TestApp,
} from './helpers.js';

describe('Lists (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /lists', () => {
    it('creates an empty list and returns it', async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .send({ title: 'Leroy Merlin' })
        .expect(201);

      // A list exposes how many items it has, not the items themselves
      expect(response.body).toEqual({
        listId: expect.any(Number),
        title: 'Leroy Merlin',
        createdAt: expect.any(String),
        itemCount: 0,
      });
      expect(new Date(response.body.createdAt).toString()).not.toBe(
        'Invalid Date',
      );
    });

    it('trims leading and trailing whitespaces from the title', async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .send({ title: '  Leroy Merlin  ' })
        .expect(201);

      expect(response.body.title).toBe('Leroy Merlin');
    });

    it.each([
      { name: '1 character', title: 'a' },
      { name: '50 characters', title: 'a'.repeat(50) },
    ])('accepts a title of $name', async ({ title }) => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .send({ title })
        .expect(201);

      expect(response.body.title).toBe(title);
    });

    it('gives a different ID to each list', async () => {
      const first = await request(app.getHttpServer())
        .post('/lists')
        .send({ title: 'First' })
        .expect(201);
      const second = await request(app.getHttpServer())
        .post('/lists')
        .send({ title: 'Second' })
        .expect(201);

      expect(second.body.listId).not.toBe(first.body.listId);
    });

    it.each([
      { name: 'a missing title', body: {} },
      { name: 'an empty title', body: { title: '' } },
      {
        name: 'a whitespace-only title (trimmed to empty before validation)',
        body: { title: '   ' },
      },
      { name: 'a title of 51 characters', body: { title: 'a'.repeat(51) } },
      { name: 'a number as title', body: { title: 123 } },
      { name: 'null as title', body: { title: null } },
      { name: 'an unknown field', body: { title: 'x', foo: 1 } },
    ])('rejects $name with 400', async ({ body }) => {
      await request(app.getHttpServer()).post('/lists').send(body).expect(400);
    });

    it('rejects a request without a body with 400', async () => {
      await request(app.getHttpServer()).post('/lists').expect(400);
    });
  });

  describe('GET /lists', () => {
    it('returns an empty array when there are no lists', async () => {
      const response = await request(app.getHttpServer())
        .get('/lists')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns all the created lists', async () => {
      const first = await createList(app, 'Leroy Merlin');
      const second = await createList(app, 'Grocery store');

      const response = await request(app.getHttpServer())
        .get('/lists')
        .expect(200);

      // Order is not part of the contract, so it is not asserted
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(expect.arrayContaining([first, second]));
    });

    it('returns the item count of each list', async () => {
      const empty = await createList(app, 'Leroy Merlin');
      const single = await createList(app, 'Grocery store');
      const double = await createList(app, 'Pharmacy');
      await createItem(app, single.listId, 'Gorgonzola');
      await createItem(app, double.listId, 'Aspirin');
      await createItem(app, double.listId, 'Bandages');

      const response = await request(app.getHttpServer())
        .get('/lists')
        .expect(200);

      // Different counts, so mixing them up between lists would be noticed
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ listId: empty.listId, itemCount: 0 }),
          expect.objectContaining({ listId: single.listId, itemCount: 1 }),
          expect.objectContaining({ listId: double.listId, itemCount: 2 }),
        ]),
      );
    });
  });

  describe('GET /lists/:listId', () => {
    it('finds a list by ID', async () => {
      const created = await createList(app, 'Leroy Merlin');

      const found = await request(app.getHttpServer())
        .get(`/lists/${created.listId}`)
        .expect(200);

      expect(found.body).toEqual(created);
    });

    it('finds the requested list among several', async () => {
      await createList(app, 'Leroy Merlin');
      const wanted = await createList(app, 'Grocery store');
      await createList(app, 'Pharmacy');

      const found = await request(app.getHttpServer())
        .get(`/lists/${wanted.listId}`)
        .expect(200);

      expect(found.body).toEqual(wanted);
    });

    it('returns 404 for a list that does not exist', async () => {
      await request(app.getHttpServer()).get('/lists/9999').expect(404);
    });

    it('returns 400 when the ID is not an integer', async () => {
      await request(app.getHttpServer()).get('/lists/abc').expect(400);
    });
  });

  describe('PATCH /lists/:listId', () => {
    it('updates the title and returns the updated list', async () => {
      const created = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send({ title: 'Grocery store' })
        .expect(200);

      // Everything but the title is unchanged
      expect(response.body).toEqual({ ...created, title: 'Grocery store' });
    });

    it('persists the change', async () => {
      const created = await createList(app, 'Leroy Merlin');
      await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send({ title: 'Grocery store' })
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`/lists/${created.listId}`)
        .expect(200);

      expect(found.body).toEqual({ ...created, title: 'Grocery store' });
    });

    it('does not change the other lists', async () => {
      const target = await createList(app, 'Leroy Merlin');
      const other = await createList(app, 'Pharmacy');

      await request(app.getHttpServer())
        .patch(`/lists/${target.listId}`)
        .send({ title: 'Grocery store' })
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`/lists/${other.listId}`)
        .expect(200);
      expect(found.body).toEqual(other);
    });

    it('trims leading and trailing whitespaces from the title', async () => {
      const created = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send({ title: '  Grocery store  ' })
        .expect(200);

      expect(response.body.title).toBe('Grocery store');
    });

    it.each([
      { name: '1 character', title: 'a' },
      { name: '50 characters', title: 'a'.repeat(50) },
    ])('accepts a title of $name', async ({ title }) => {
      const created = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send({ title })
        .expect(200);

      expect(response.body.title).toBe(title);
    });

    it.each([
      { name: 'an empty object', body: {} },
      { name: 'no body', body: undefined },
    ])('leaves the list unchanged when given $name', async ({ body }) => {
      const created = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send(body)
        .expect(200);

      expect(response.body).toEqual(created);
    });

    it.each([
      { name: 'an empty title', body: { title: '' } },
      {
        name: 'a whitespace-only title (trimmed to empty before validation)',
        body: { title: '   ' },
      },
      { name: 'a title of 51 characters', body: { title: 'a'.repeat(51) } },
      { name: 'a number as title', body: { title: 123 } },
      // An omitted title means "keep it", but an explicit null is rejected
      { name: 'null as title', body: { title: null } },
      { name: 'an unknown field', body: { title: 'x', foo: 1 } },
    ])('rejects $name with 400', async ({ body }) => {
      const created = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .patch(`/lists/${created.listId}`)
        .send(body)
        .expect(400);
    });

    it('returns 404 for a list that does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/lists/9999')
        .send({ title: 'Grocery store' })
        .expect(404);
    });

    it('returns 400 when the ID is not an integer', async () => {
      await request(app.getHttpServer())
        .patch('/lists/abc')
        .send({ title: 'Grocery store' })
        .expect(400);
    });
  });

  describe('DELETE /lists/:listId', () => {
    it('returns the deleted list', async () => {
      const created = await createList(app, 'Leroy Merlin');

      const response = await request(app.getHttpServer())
        .delete(`/lists/${created.listId}`)
        .expect(200);

      expect(response.body).toEqual(created);
    });

    it('makes the list unavailable afterwards', async () => {
      const created = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .delete(`/lists/${created.listId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/lists/${created.listId}`)
        .expect(404);
    });

    it('makes its items unavailable afterwards', async () => {
      const created = await createList(app, 'Leroy Merlin');
      const item = await createItem(app, created.listId, 'Gorgonzola');

      await request(app.getHttpServer())
        .delete(`/lists/${created.listId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/lists/${created.listId}/items`)
        .expect(404);
      await request(app.getHttpServer())
        .get(`/lists/${created.listId}/items/${item.itemId}`)
        .expect(404);
    });

    it('only removes the targeted list', async () => {
      const first = await createList(app, 'Leroy Merlin');
      const target = await createList(app, 'Grocery store');
      const third = await createList(app, 'Pharmacy');

      await request(app.getHttpServer())
        .delete(`/lists/${target.listId}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/lists')
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(expect.arrayContaining([first, third]));
    });

    it('returns 404 when deleting the same list twice', async () => {
      const created = await createList(app, 'Leroy Merlin');

      await request(app.getHttpServer())
        .delete(`/lists/${created.listId}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/lists/${created.listId}`)
        .expect(404);
    });

    it('returns 404 for a list that does not exist', async () => {
      await request(app.getHttpServer()).delete('/lists/9999').expect(404);
    });

    it('returns 400 when the ID is not an integer', async () => {
      await request(app.getHttpServer()).delete('/lists/abc').expect(400);
    });
  });
});
