import { FakeFirestore } from 'firestore-jest-mock';
import { mockCollection, mockDoc } from 'firestore-jest-mock/mocks/firestore';

describe('Memes CRUD operations testing', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	const db = () =>
		new FakeFirestore(
			{
				users: [
					{ id: 'bt69YV48XGTqRj8E3bM8i0Q44V62', displayName: 'ADMIN', email: 'admin@gmail.com', role: 'admin' },
					{ id: 'u5qw9zpRUlhcrVmRvkd410jVN8x2', displayName: 'USER', email: 'user@gmail.com', role: 'user' },
				],
				memes: [
					{ id: 'memeID', text: 'meme text', createdAt: 'today', isPublished: false, likes: 0, mediaURL: 'media.com', userId: 'bt69YV48XGTqRj8E3bM8i0Q44V62'},
					{ id: 'memeID2', text: 'meme text2', createdAt: 'yesterday', isPublished: false, likes: 0, mediaURL: 'media.com', userId: 'u5qw9zpRUlhcrVmRvkd410jVN8x2'},
				],
			},
		);
  
	describe('Get one meme with params', () => {
		test('Get meme', async() => {
			expect.assertions(6);
			const record = await db()
				.collection('memes')
				.doc('memeID')
				.get();
			expect(mockCollection).toHaveBeenCalledWith('memes');
			expect(mockDoc).toHaveBeenCalledWith('memeID');
			expect(record.exists).toBe(true);
			expect(record.id).toBe('memeID');
			const data = record.data();
			expect(data).toHaveProperty('text', 'meme text');
			expect(data).toHaveProperty('userId', 'bt69YV48XGTqRj8E3bM8i0Q44V62');
		});
	});
});
