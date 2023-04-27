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
	let userMemeId: string | undefined;
	let newUserMemeId: string | undefined;
	let profaneMemeId: string | undefined;

	const reqCases = [
		['post', URL.ROOT + URL.MEMES.ROOT],
		['get', URL.ROOT + URL.MEMES.ROOT],
		['get', `${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`],
		['get', `${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`],
		['patch', `${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`],
		['patch', `${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`],
		['delete', `${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`],
		['delete', `${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`],
		['put', `${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`],
		['put', `${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`],
	];

	beforeAll(async() => {
		const response = await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNUP)
			.send(userCredentials.admin.signUp);
		
		adminId = response.body.uid;

		await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNIN)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

	 	const res = await request(app)
			.post(URL.ROOT + URL.MEMES.ROOT)
			.field('text', memeCreds.text)
			.attach('file', 'tests/memePic.jpg')
			.set('Authorization', `Bearer ${userToken}`);

		adminMemeId = res.body.memeId;
	});

	beforeAll(async() => {
		const { body } = await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNUP)
			.send(userCredentials.user.signUp);

		userId = body.uid;

		await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNIN)
			.send(userCredentials.user.signIn);

		userToken = await auth.currentUser?.getIdToken();

	  const res = await request(app)
			.post(URL.ROOT + URL.MEMES.ROOT)
			.field('text', memeCreds.text)
			.attach('file', 'tests/memePic.jpg')
			.set('Authorization', `Bearer ${userToken}`);

		userMemeId = res.body.memeId;
	});

	beforeEach(async() => {
		await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNIN)
			.send(userCredentials.user.signIn);

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
				.post(URL.ROOT + URL.MEMES.ROOT)
				.field('text', memeCreds.text)
				.set('Authorization', `Bearer ${userToken}`);

			expect(statusCode).toBe(statusCodes.BAD_REQUEST);
			expect(body).toBe(responses.missingFile);
		});

		test('should return 201 and success message', async() => {
			const { statusCode, body } = await request(app)
				.post(URL.ROOT + URL.MEMES.ROOT)
				.field('text', memeCreds.text)
				.attach('file', 'tests/memePic.jpg')
				.set('Authorization', `Bearer ${userToken}`);

			const { message, memeId } = body;

			newUserMemeId = memeId;

			expect(statusCode).toBe(statusCodes.CREATED);
			expect(message).toBe(responses.memeCreated);
		});

		test('should return 201 and success message (profane text)', async() => {
			const { statusCode, body } = await request(app)
				.post(URL.ROOT + URL.MEMES.ROOT)
				.field('text', memeCreds.profaneText)
				.attach('file', 'tests/memePic.jpg')
				.set('Authorization', `Bearer ${userToken}`);

			const { message, memeId } = body;

			profaneMemeId = memeId;

			expect(statusCode).toBe(statusCodes.CREATED);
			expect(message).toBe(responses.memeCreated);
		});
	});

	describe('GET all memes', () => {

		test('should return 200 and no content message', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.ROOT + URL.MEMES.ROOT)
				.set('Authorization', `Bearer ${userToken}`);

			expect(statusCode).toBe(statusCodes.OK);
			expect(body).toBe(responses.memesUnpublished);
		});
	});

	describe('GET meme', () => {

		describe('Own meme', () => {

			test('should return 200 and meme', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('userId', userId);
			});

			test('should return 200 and meme (profane)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.MEMES.ROOT}/${profaneMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('userId', userId);
				expect(body).toHaveProperty('likes', -3);
			});
		});

		describe('Other user meme', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('UPDATE meme', () => {

		describe('Own meme', () => {

			test('should return 200 and success message (text and file)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.ROOT}${URL.MEMES.ROOT}/${newUserMemeId}`)
					.field('text', memeCreds.textUpdated)
					.attach('file', 'tests/memePic.jpg')
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUpdated);
			});

			test('should return 200 and success message (only text)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.ROOT}${URL.MEMES.ROOT}/${newUserMemeId}`)
					.field('text', memeCreds.textUpdated)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUpdated);
			});
		});

		describe('Other user data', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('REMOVE meme', () => {

		describe('removing other meme', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});

		describe('removing own meme', () => {

			test('should return 200 and success message', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.ROOT}${URL.MEMES.ROOT}/${newUserMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeDeleted);
			});
		});
	});

	describe('PUT like to meme', () => {

		describe('simple like own meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('super like own meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('simple like other meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});

		describe('super like other meme', () => {
			
			test('should return 200 and success message (like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeRated);
			});

			test('should return 200 and success message (remove like)', async() => {
				const { statusCode, body } = await request(app)
					.put(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(memeCreds.superLike);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(responses.memeUnrated);
			});
		});
	});

	afterAll(async() => {
		await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNIN)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

		await request(app)
			.delete(`${URL.ROOT}${URL.MEMES.ROOT}/${userMemeId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.ROOT}${URL.MEMES.ROOT}/${adminMemeId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.ROOT + URL.USERS.ROOT}/${userId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.ROOT + URL.USERS.ROOT}/${adminId}`)
			.set('Authorization', `Bearer ${userToken}`);
	});
});
