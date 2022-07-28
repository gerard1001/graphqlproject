import { objectType } from 'nexus';

export const User = objectType({
	name: 'User',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.string('name');
		t.nonNull.string('email');
		t.nonNull.DateTime('createdAt');
		t.nonNull.list.nonNull.field('flashcardsRead', {
			type: 'UserReadFlashcard',
			// @ts-ignore
			async resolve(parent, args, context) {
				// @ts-ignore
				return context.prisma.user.findUnique({ where: { id: parent.id } }).flashcardsRead();
			},
		});
		t.nonNull.list.nonNull.field('flashcardsCreated', {
			type: 'FlashCard',
			async resolve(parent, args, context) {
				// @ts-ignore
				return context.prisma.user.findUnique({ where: { id: parent.id } }).flashcardsCreated();
			},
		});
	},
});
