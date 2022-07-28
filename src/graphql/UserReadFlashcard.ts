import { Prisma } from '@prisma/client';
import { defaultFieldResolver } from 'graphql';
import { objectType } from 'nexus';
import { User } from './User';

export const UserReadFlashcard = objectType({
	name: 'UserReadFlashcard',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.int('confidence');
		t.nonNull.DateTime('readAt');
		t.field('user', {
			type: 'User',
			// @ts-ignore
			resolve: (parent, __, ctx) => {
				return ctx.prisma.userReadFlashcard.findUnique({ where: { id: parent.id } }).user();
			},
		});
		t.field('flashCard', {
			type: 'FlashCard',
			// @ts-ignore
			resolve: (parent, __, ctx) => {
				return ctx.prisma.userReadFlashcard.findUnique({ where: { id: parent.id } }).flashcard();
			},
		});
	},
});
