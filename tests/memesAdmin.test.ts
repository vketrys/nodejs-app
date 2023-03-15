import request from 'supertest';
import { app, auth } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { memeCreds, userCredentials } from './creds';

describe('User meme CRUD operations', () => {
	let userToken: string | undefined;

	let adminId: string | undefined;
	let userId: string | undefined;

	let adminMemeId: string | undefined;
	let newAdminMemeId: string | undefined;

	let userMemeId: string | undefined;

	const reqCases = [
		['post', URL.MEMES.TEST],
		['get', URL.MEMES.TEST],
		['get', `${URL.MEMES.TEST}/${adminMemeId}`],
		['get', `${URL.MEMES.TEST}/${userMemeId}`],
		['patch', `${URL.MEMES.TEST}/${adminMemeId}`],
		['patch', `${URL.MEMES.TEST}/${userMemeId}`],
		['delete', `${URL.MEMES.TEST}/${adminMemeId}`],
		['delete', `${URL.MEMES.TEST}/${userMemeId}`],
		['put', `${URL.MEMES.TEST}/${adminMemeId}`],
		['put', `${URL.MEMES.TEST}/${userMemeId}`],
	];

	beforeAll(async() => {
		const response = await request(app)
			.post(`/api${URL.AUTH.SIGNUP}`)
			.send(userCredentials.admin.signUp);
		
		adminId = response.body.uid;

		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

	 	const res = await request(app)
			.post(URL.MEMES.TEST)
			.field('text', memeCreds.text)
			.attach('file', 'tests/memePic.jpg')
			.set('Authorization', `Bearer ${userToken}`);

		adminMemeId = res.body.memeId;
	});

	beforeAll(async() => {
		const { body } = await request(app)
			.post(`/api${URL.AUTH.SIGNUP}`)
			.send(userCredentials.user.signUp);

		userId = body.uid;

		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.user.signIn);

		userToken = await auth.currentUser?.getIdToken();

	  const res = await request(app)
			.post(URL.MEMES.TEST)
			.field('text', memeCreds.text)
			.attach('file', 'tests/memePic.jpg')
			.set('Authorization', `Bearer ${userToken}`);

		userMemeId = res.body.memeId;
	});

	beforeEach(async() => {
		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();
	});

	describe('Repetable error request for each HTTP methods', () => {

		test.each(reqCases)(
			'should return 401 and error message (authorization issue) for %s to url at index %#',
			async(req, url) => {
				const { statusCode, body } = await request(app)[req](url)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.UNAUTHORIZED);
				expect(body).toBe(responses.unauthorized);
			});

		test.each(reqCases)(
			'should return 498 and error message (wrong token) for %s to url at index %#',
			async(req, url) => {
				const { statusCode, body } = await request(app)[req](url)
					.set('Authorization', `Bearer ${userToken} a`);
	
				expect(statusCode).toBe(statusCodes.INVALID_TOKEN);
				expect(body).toBe(responses.tokenIssue);
			});
	});

	describe('POST new meme', () => {

		test('should return 400 and error message (missing file)', async() => {
			const { statusCode, body } = await request(app)
				.post(URL.MEMES.TEST)
				.field('text', memeCreds.text)
				.set('Authorization', `Bearer ${userToken}`);

			expect(statusCode).toBe(statusCodes.BAD_REQUEST);
			expect(body).toBe(responses.missingFile);
		});

		test('should return 201 and success message', async() => {
			const { statusCode, body } = await request(app)
				.post(URL.MEMES.TEST)
				.field('text', memeCreds.text)
				.attach('file', 'tests/memePic.jpg')
				.set('Authorization', `Bearer ${userToken}`);

			const { message, memeId } = body;

			newAdminMemeId = memeId;

			expect(statusCode).toBe(statusCodes.CREATED);
			expect(message).toBe(responses.memeCreated);
		});
	});

	describe('GET all memes', () => {

		test('should return 200 and memes array', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.MEMES.TEST)
				.set('Authorization', `Bearer ${userToken}`);

			const { memes } = body;

			expect(statusCode).toBe(statusCodes.OK);
			expect(body).toHaveProperty('memes');
			expect(memes).toHaveLength(3);
			expect(memes[0].userId === adminId || memes[0].userId === userId).toBeTruthy();
			expect(memes[1].userId === adminId || memes[1].userId === userId).toBeTruthy();
		});
	});

	describe('GET meme', () => {

		describe('Own meme', () => {

			test('should return 200 and meme', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.MEMES.TEST}/${newAdminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('userId', adminId);
			});
		});

		describe('Other user meme', () => {

			test('should return 200 and meme', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('userId', userId);
			});
		});
	});

	describe('UPDATE meme', () => {

		describe('Own meme', () => {

			test('should return 200 and success message (text and file)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.MEMES.TEST}/${newAdminMemeId}`)
					.field('text', memeCreds.text)
					.attach('file', 'tests/memePic.jpg')
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUpdated);
			});

			test('should return 200 and success message (only text)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.MEMES.TEST}/${newAdminMemeId}`)
					.field('text', memeCreds.text)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUpdated);
			});
		});

		describe('Other user data', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('PUT like to meme', () => {

		describe('simple like own meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('super like own meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('simple like other meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('super like other meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});
	});

	describe('REMOVE meme', () => {

		describe('removing other meme', () => {

			test('should return 200 and success message', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.MEMES.TEST}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeDeleted);
			});
		});

		describe('removing own meme', () => {

			test('should return 200 and success message', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.MEMES.TEST}/${newAdminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeDeleted);
			});
		});
	});

	afterAll(async() => {
		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

		await request(app)
			.delete(`${URL.MEMES.TEST}/${adminMemeId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.USERS.TEST}/${userId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.USERS.TEST}/${adminId}`)
			.set('Authorization', `Bearer ${userToken}`);
	});
});
