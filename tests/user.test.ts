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
		['get', URL.USERS.TEST],
		['get', `${URL.USERS.TEST}/${adminId}`],
		['get', `${URL.USERS.TEST}/${userId}`],
		['patch', `${URL.USERS.TEST}/${adminId}`],
		['patch', `${URL.USERS.TEST}/${userId}`],
		['delete', `${URL.USERS.TEST}/${adminId}`],
		['delete', `${URL.USERS.TEST}/${userId}`],
	];

	beforeAll(async() => {
		const response = await request(app)
			.post(`/api${URL.AUTH.SIGNUP}`)
			.send(userCredentials.admin.signUp);
		
		adminId = response.body.uid;

		const { body } = await request(app)
			.post(`/api${URL.AUTH.SIGNUP}`)
			.send(userCredentials.user.signUp);

		userId = body.uid;
	});

	beforeEach(async() => {
		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.user.signIn);

		userToken = await auth.currentUser?.getIdToken();
	});

	describe('Repetable error request for each HTTP methods', () => {

		test.each(reqCases)(
			'should return 401 and error message (authorization issue) for %s to url at index %#',
			async(req, url) => {
				const { statusCode, body } = await request(app)[req](url)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

		test.each(reqCases)(
			'should return 498 and error message (wrong token) for %s to url at index %#',
			async(req, url) => {
				const { statusCode, body } = await request(app)[req](url)
					.set('Authorization', `Bearer ${userToken} a`);
	
				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});
	});

	describe('GET all users', () => {

		test('should return 403 and error message (permission issue)', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.USERS.TEST)
				.set('Authorization', `Bearer ${userToken}`);

			expect(statusCode).toBe(statusCodes.forbidden_403);
			expect(body).toBe(responses.permissionIssue);
		});
	});

	describe('GET user', () => {

		describe('Own user data', () => {

			test('should return 200 and user data', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toHaveProperty('uid', userId);
			});
		});

		describe('Other user data', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.forbidden_403);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('UPDATE user data', () => {

		describe('Own user data', () => {

			test('should return 400 and error message (missing fields)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.user.updateWrong);

				expect(statusCode).toBe(statusCodes.badRequest_400);
				expect(body).toBe(responses.missingFields);
			});

			test('should return 200 and new user data', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.user.updateCorrect);

				expect(statusCode).toBe(statusCodes.ok_200);
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
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.forbidden_403);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});

	describe('REMOVE user', () => {

		describe('removing other account', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.forbidden_403);
				expect(body).toBe(responses.permissionIssue);
			});
		});

		describe('removing own account', () => {

			test('should return 403 and error message (permission issue)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.forbidden_403);
				expect(body).toBe(responses.permissionIssue);
			});
		});
	});
	afterAll(async() => {
		await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();

		await request(app)
			.delete(`${URL.USERS.TEST}/${userId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.USERS.TEST}/${adminId}`)
			.set('Authorization', `Bearer ${userToken}`);
	});
});
