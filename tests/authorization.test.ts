import request from 'supertest';
import { app, auth } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { userCredentials } from './creds';
import { Roles } from '../src/constants/roles';

describe('Firebase authorization', () => {
	let userToken: string | undefined;
	let userId: string | undefined;
	let adminId: string | undefined;

	describe('Sign up', () => {
		
		describe('User sign up without email or password', () => {

			test('should return 422 and error message (without email)', async() => {

				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNUP}`)
					.send(userCredentials.withoutEmail);

				expect(statusCode).toBe(statusCodes.UNPROCESSIBLE_ENTITY);
				expect(body).toBe(responses.emailRequired);
			});

			test('should return 422 and error message (without password)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNUP}`)
					.send(userCredentials.withoutPassword);

				expect(statusCode).toBe(statusCodes.UNPROCESSIBLE_ENTITY);
				expect(body).toBe(responses.passwordRequired);
			});
		});

		describe('Admin sign up success', () => {

			test('should return 201 and email (admin)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNUP}`)
					.send(userCredentials.admin.signUp);

				expect(statusCode).toBe(statusCodes.CREATED);

				await request(app)
					.post(`/api${URL.AUTH.SIGNIN}`)
					.send(userCredentials.admin.signIn);

				const userEmail = auth.currentUser?.email;

				expect(body).toHaveProperty('email', userEmail);
				expect(body).toHaveProperty('role', Roles.ADMIN);
			});
		});

		describe('User sign up success', () => {

			test('should return 201 and email (user)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNUP}`)
					.send(userCredentials.user.signUp);

				expect(statusCode).toBe(statusCodes.CREATED);
				expect(body).toHaveProperty('email', userCredentials.user.signIn.email);
				expect(body).toHaveProperty('role', Roles.USER);
			});
		});
	});

	describe('Sign in:', () => {

		describe('Sign in without email or password', () => {
			
			test('should return 422 and error message (without email)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNIN}`)
					.send(userCredentials.withoutEmail);

				expect(statusCode).toBe(statusCodes.UNPROCESSIBLE_ENTITY);
				expect(body).toBe(responses.emailRequired);
			});

			test('should return 422 and error message (without password)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNIN}`)
					.send(userCredentials.withoutPassword);

				expect(statusCode).toBe(statusCodes.UNPROCESSIBLE_ENTITY);
				expect(body).toBe(responses.passwordRequired);
			});
		});

		describe('Sign in success', () => {

			test('should return 201 and token (user)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNIN}`)
					.send(userCredentials.user.signIn);
				
				const jwtToken = await auth.currentUser?.getIdToken();
				userId = auth.currentUser?.uid;

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(jwtToken);
			});

			test('should return 201 and token (admin)', async() => {
				const { statusCode, body } = await request(app)
					.post(`/api${URL.AUTH.SIGNIN}`)
					.send(userCredentials.admin.signIn);
				
				const jwtToken = await auth.currentUser?.getIdToken();
				userToken = jwtToken;
				adminId = auth.currentUser?.uid;

				expect(statusCode).toBe(statusCodes.OK);
				expect(body).toBe(jwtToken);
			});
		});
	});

	afterAll(async() => {
		await request(app)
			.delete(`${URL.USERS.TEST}/${userId}`)
			.set('Authorization', `Bearer ${userToken}`);

		await request(app)
			.delete(`${URL.USERS.TEST}/${adminId}`)
			.set('Authorization', `Bearer ${userToken}`);
	});
});
