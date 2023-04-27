import request from 'supertest';
import { app, auth } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { userCredentials } from './creds';

describe('User CRUD operations', () => {
	let userToken: string | undefined;
	let adminId: string | undefined;
	let userId: string | undefined;

	const reqCases = [
		['get', URL.ROOT + URL.USERS.ROOT],
		['get', `${URL.ROOT}${URL.USERS.ROOT}/${adminId}`],
		['get', `${URL.ROOT}${URL.USERS.ROOT}/${userId}`],
		['patch', `${URL.ROOT}${URL.USERS.ROOT}/${adminId}`],
		['patch', `${URL.ROOT}${URL.USERS.ROOT}/${userId}`],
		['delete', `${URL.ROOT}${URL.USERS.ROOT}/${adminId}`],
		['delete', `${URL.ROOT}${URL.USERS.ROOT}/${userId}`],
	];

	beforeAll(async() => {
		const response = await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNUP)
			.send(userCredentials.admin.signUp);
		
		adminId = response.body.uid;

		const { body } = await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNUP)
			.send(userCredentials.user.signUp);

		userId = body.uid;
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

	describe('GET all users', () => {

		test('should return 403 and error message (permission issue)', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.ROOT + URL.USERS.ROOT)
				.set('Authorization', `Bearer ${userToken}`);

			expect(statusCode).toBe(statusCodes.FORBIDDEN);
			expect(body).toBe(responses.permissionIssue);
		});
	});

	describe('GET user', () => {

		describe('Own user data', () => {

			test('should return 200 and user data', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.USERS.ROOT}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('uid', userId);
			});
		});

		describe('Other user data', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.USERS.ROOT}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('UPDATE user data', () => {

		describe('Own user data', () => {

			test('should return 400 and error message (missing fields)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.ROOT}${URL.USERS.ROOT}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.user.updateWrong);

				expect(statusCode).toBe(statusCodes.BAD_REQUEST);
				expect(body).toBe(responses.missingFields);
			});

			test('should return 200 and new user data', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.ROOT}${URL.USERS.ROOT}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.user.updateCorrect);

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toHaveProperty('uid', userId);
				expect(body)
					.toHaveProperty(
						'displayName',
						userCredentials.user.updateCorrect.displayName,
					);
			});
		});

		describe('Other user data', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.USERS.ROOT}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('REMOVE user', () => {

		describe('removing other account', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.ROOT}${URL.USERS.ROOT}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});

		describe('removing own account', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.ROOT}${URL.USERS.ROOT}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.FORBIDDEN);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('PUT words to profane dictionary', () => {
		
		test('should return 403 and error message (permission issue)', async() => {
			const { statusCode, body } = await request(app)
				.put(URL.ROOT + URL.ADMIN.ROOT + URL.ADMIN.PROFANE)
				.set('Authorization', `Bearer ${userToken}`)
				.send(userCredentials.profane.correct);

			expect(statusCode).toBe(statusCodes.FORBIDDEN);
			expect(body).toBe(responses.permissionIssue);
		});
	});

	afterAll(async() => {
		await request(app)
			.post(URL.ROOT + URL.AUTH.SIGNIN)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

		await request(app)
			.delete(`${URL.ROOT}${URL.USERS.ROOT}/${userId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.ROOT}${URL.USERS.ROOT}/${adminId}`)
			.set('Authorization', `Bearer ${userToken}`);
	});
});
