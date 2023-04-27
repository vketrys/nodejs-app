export const userCredentials = {
	withoutEmail: {
		password: '123456qwerty',
	},
	withoutPassword: {
		email: 'test@gmail.com',
	},
	admin: {
		signUp: {
			email: 'test@gmail.com',
	    password: '123456qwerty',
	    displayName: 'admin',
		},
		signIn: {
			email: 'test@gmail.com',
	    password: '123456qwerty',
		},
		updateWrong: {
			displayName: 'admin updated',
		},
		updateCorrect: {
			password: '123456qwerty',
			displayName: 'admin updated',
		},
	},
	user: {
		signUp: {
			email: 'user@gmail.com',
	    password: '123456qwerty',
	    displayName: 'user',
		},
		signIn: {
			email: 'user@gmail.com',
	    password: '123456qwerty',
		},
		updateWrong: {
			displayName: 'user updated',
		},
		updateCorrect: {
			password: '123456qwerty',
			displayName: 'user updated',
		},
	},
};

export const memeCreds = {
	text: 'meme text',
	textUpdated: 'updated meme text',
	superLike: {
		count: 10,
	},
};
