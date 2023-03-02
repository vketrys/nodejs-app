import request from 'supertest';
import { app, auth } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { userCredentials } from './creds';

describe('Admin CRUD operations', () => {
	let userToken: string | undefined;
	let adminId: string | undefined;
	let userId: string | undefined;

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
			.send(userCredentials.admin.signIn);

		userToken = await auth.currentUser?.getIdToken();
	});

	describe('GET all users', () => {
		test('should return 401 and error message (authorization issue)', async() => {
			//.each([request(app).get, userToken])
			const { statusCode, body } = await request(app)
				.get(URL.USERS.TEST)
				.set('Authorization', `Beare ${userToken}`);

			expect(statusCode).toBe(statusCodes.unauthorized_401);
			expect(body).toBe(responses.unauthorized);
		});

		test('should return 498 and error message (wrong token)', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.USERS.TEST)
				.set('Authorization', `Bearer ${userToken} a`);

			expect(statusCode).toBe(statusCodes.invalidToken_498);
			expect(body).toBe(responses.tokenIssue);
		});

		test('should return 200 and user list', async() => {
			const { statusCode, body } = await request(app)
				.get(URL.USERS.TEST)
				.set('Authorization', `Bearer ${userToken}`);

			const { users } = body;

			expect(statusCode).toBe(statusCodes.ok_200);
			expect(body).toHaveProperty('users');
			expect(users).toHaveLength(2);
			expect(users[0].uid === adminId || users[0].uid === userId).toBeTruthy();
			expect(users[1].uid === adminId || users[1].uid === userId).toBeTruthy();
		});
	});

	describe('GET user', () => {

		describe('Own user data', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});

			test('should return 200 and user data', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toHaveProperty('uid', adminId);
			});
		});

		describe('Other user data', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});

			test('should return 200 and user data', async() => {
				const { statusCode, body } = await request(app)
					.get(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toHaveProperty('uid', userId);
			});
		});
	});

	describe('UPDATE user data', () => {

		describe('Own user data', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});

			test('should return 400 and error message (missing fields)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.admin.updateWrong);

				expect(statusCode).toBe(statusCodes.badRequest_400);
				expect(body).toBe(responses.missingFields);
			});
			test('should return 200 and new user data', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`)
					.send(userCredentials.admin.updateCorrect);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toHaveProperty('uid', adminId);
				expect(body)
					.toHaveProperty(
						'displayName',
						userCredentials.admin.updateCorrect.displayName,
					);
			});
		});

		describe('Other user data', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.patch(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});

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
	});

	describe('REMOVE user', () => {

		describe('removing other account', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});

			test('should return 200 and message with email', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${userId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toBe(
					`${userCredentials.user.signIn.email} ${responses.userRemoved}`,
				);
			});
		});

		describe('removing own account', () => {

			test('should return 401 and error message (authorization issue)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Beare ${userToken}`);

				expect(statusCode).toBe(statusCodes.unauthorized_401);
				expect(body).toBe(responses.unauthorized);
			});

			test('should return 498 and error message (wrong token)', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken} a`);

				expect(statusCode).toBe(statusCodes.invalidToken_498);
				expect(body).toBe(responses.tokenIssue);
			});
			
			test('should return 200 and message with email', async() => {
				const { statusCode, body } = await request(app)
					.delete(`${URL.USERS.TEST}/${adminId}`)
					.set('Authorization', `Bearer ${userToken}`);

				expect(statusCode).toBe(statusCodes.ok_200);
				expect(body).toBe(
					`${userCredentials.admin.signIn.email} ${responses.userRemoved}`,
				);
			});
		});
	});
});
