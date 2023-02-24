import { mockFirebase } from 'firestore-jest-mock';
import { mockCollection, mockGet } from 'firestore-jest-mock/mocks/firestore';
import request from 'supertest';
import { app } from '../src/index';
import { URL } from '../src/constants/URL';
import { statusCodes } from '../src/constants/codes';
import { responses } from '../src/constants/responses';
import { signInUserCredentials } from './authorization.test';

describe('User CRUD controllers testing', () => {
	mockFirebase({
		database: {
			users: [
				{ id: 'bt69YV48XGTqRj8E3bM8i0Q44V62', displayName: 'ADMIN', email: 'admin@gmail.com', role: 'admin' },
				{ id: 'u5qw9zpRUlhcrVmRvkd410jVN8x2', displayName: 'USER', email: 'user@gmail.com', role: 'user' },
			],
		},
	});

	let userToken: string;

	beforeAll(async() => {
		const { body } = await request(app)
			.post(`/api${URL.AUTH.SIGNIN}`)
			.send(signInUserCredentials);
		
		userToken = body;
	});

	describe('GET all users', () => {
		test('asas', async() => {
			
			request(app)
				.get(`/api${URL.USERS.ROOT}`)
				.set('Authorization', `Bearer ${userToken}`)
				.then((userDocs) => {
					expect(mockCollection).toHaveBeenCalledWith('users');
      		expect(userDocs[0].name).toEqual('Homer Simpson');
				});
			
		});
	});
});
