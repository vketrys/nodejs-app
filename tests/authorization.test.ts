/* eslint-disable @typescript-eslint/no-var-requires */
import request from 'supertest';
import { app } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { getAuth } from 'firebase/auth';
import firebaseApp, { firebaseConfig } from '../src/config/firebase';
import { mockFirebase } from 'firestore-jest-mock';

const correctUserCredentials = {
	email: 'test@gmail.com',
	password: '123456qwerty',
	displayName: 'testUser',
};

export const signInUserCredentials = {
	email: 'test@gmail.com',
	password: '123456qwerty',
};

const userCredentialsWithoutEmail = {
	password: '123456qwerty',
};

const userCredentialsWithoutPassword = {
	email: 'test@gmail.com',
};

describe('Firebase authorization tests', () => {
	mockFirebase({
		database: {
			users: [
				{ id: 'abc123', first: 'Bob', last: 'builder', born: 1998 },
				{
					id: '123abc',
					first: 'Blues',
					last: 'builder',
					born: 1996,
					_collections: {
						cities: [{ id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA', visited: true }],
					},
				},
			],
			cities: [
				{ id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA' },
				{ id: 'DC', name: 'Disctric of Columbia', state: 'DC', country: 'USA' },
			],
		},
		currentUser: { uid: 'abc123', displayName: 'Bob' },
	});

	const firebase = require('firebase');
	const admin = require('firebase-admin');

	beforeEach(() => {
		jest.clearAllMocks();
		firebase.initializeApp(firebaseConfig);
	});

	// let userId: string;
	// let userToken: string | undefined;

	// describe('Sign up', () => {
		
	// 	describe('User sign up without email', () => {
	// 		test('should return 422 and error message', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNUP}`)
	// 				.send(userCredentialsWithoutEmail);

	// 			expect(statusCode).toBe(statusCodes.unprocessableEntity_422);
	// 			expect(body).toBe(responses.emailRequired);
	// 		});
	// 	});

	// 	describe('User sign up without password', () => {
	// 		test('should return 422 and error message', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNUP}`)
	// 				.send(userCredentialsWithoutPassword);

	// 			expect(statusCode).toBe(statusCodes.unprocessableEntity_422);
	// 			expect(body).toBe(responses.passwordRequired);
	// 		});
	// 	});

	// 	describe('User sign up success', () => {
	// 		test('should return 201 and email', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNUP}`)
	// 				.send(correctUserCredentials);

	// 			userId = body.uid;

	// 			expect(statusCode).toBe(statusCodes.created_201);
	// 			expect(body).toHaveProperty('email', correctUserCredentials.email);
	// 		});
	// 	});
	// });

	// describe('Sign in', () => {

	// 	describe('Sign in without email', () => {
	// 		test('should return 422 and error message', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNIN}`)
	// 				.send(userCredentialsWithoutEmail);

	// 			expect(statusCode).toBe(statusCodes.unprocessableEntity_422);
	// 			expect(body).toBe(responses.emailRequired);
	// 		});
	// 	});

	// 	describe('Sign in without password', () => {
	// 		test('should return 422 and error message', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNIN}`)
	// 				.send(userCredentialsWithoutPassword);

	// 			expect(statusCode).toBe(statusCodes.unprocessableEntity_422);
	// 			expect(body).toBe(responses.passwordRequired);
	// 		});
	// 	});

	// 	describe('User sign in success', () => {
	// 		test('should return 201 and email', async() => {
	// 			const { statusCode, body } = await request(app)
	// 				.post(`/api${URL.AUTH.SIGNIN}`)
	// 				.send(signInUserCredentials);
				
	// 			const auth = getAuth(firebaseApp);
	// 			const jwtToken = await auth.currentUser?.getIdToken();

	// 			userToken = jwtToken;

	// 			expect(statusCode).toBe(statusCodes.ok_200);
	// 			expect(body).toBe(jwtToken);
	// 		});
	// 	});
	// });

	// afterAll(async() => {
	// 	await request(app)
	// 		.delete(`/api/users/${userId}`)
	// 		.set('Authorization', `Bearer ${userToken}`);
	// });
});
