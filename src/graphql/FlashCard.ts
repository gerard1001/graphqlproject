import { Prisma } from '@prisma/client';
import {
	arg,
	enumType,
	extendType,
	inputObjectType,
	intArg,
	list,
	nonNull,
	objectType,
	stringArg,
} from 'nexus';

export const FlashCard = objectType({
	name: 'FlashCard',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.DateTime('createdAt');
		t.nonNull.string('question');
		t.nonNull.string('answer');
		t.field('author', {
			type: 'User',
			// @ts-ignore
			async resolve(parent, args, context) {
				return context.prisma.flashCard.findUnique({ where: { id: parent.id } }).author();
			},
		});
		t.list.field('usersRead', {
			type: 'UserReadFlashcard',
			// @ts-ignore
			async resolve(parent, args, context) {
				// @ts-ignore
				return context.prisma.flashCard.findUnique({ where: { id: parent.id } }).usersRead();
			},
		});
	},
});
export const cardOrderByInput = inputObjectType({
	name: 'cardOrderByInput',
	definition(t) {
		t.field('id', { type: Sort });
		t.field('question', { type: Sort });
		t.field('answer', { type: Sort });
		t.field('createdAt', { type: Sort });
	},
});
export const Sort = enumType({
	name: 'Sort',
	members: ['asc', 'desc'],
});
export const FindCard = objectType({
	name: 'FindCard',
	definition(t) {
		t.nonNull.list.nonNull.field('cards', { type: FlashCard });
		t.nonNull.int('count');
	},
});

export const flashcardQuery = extendType({
	type: 'Query',
	definition(t) {
		t.field('findCard', {
			type: 'FindCard',
			args: {
				id: intArg(),
				email: stringArg(),
				filter: stringArg(),
				take: intArg(),
				skip: intArg(),
				orderBy: arg({ type: list(nonNull(cardOrderByInput)) }),
			},
			// @ts-ignore
			async resolve(parent, args, context, info) {
				const { prisma } = context;
				let { id, email, filter, take, skip, orderBy } = args;

				let where = filter
					? {
							OR: [{ question: { contains: filter } }, { answer: { contains: filter } }],
					  }
					: {};

				if (id) {
					where = Object.assign(where, { id });
					take = 1;
					skip = 0;
				}

				if (email) {
					where = Object.assign(where, { author: { email } });
				}

				const cards = prisma.flashCard.findMany({
					where,
					take: take as number | undefined,
					skip: skip as number | undefined,
					orderBy: orderBy as
						| Prisma.Enumerable<Prisma.FlashCardOrderByWithRelationInput>
						| undefined,
					include: { author: true, usersRead: true },
				});

				const count = await context.prisma.flashCard.count({ where });

				return {
					count,
					cards,
				};
			},
		});
	},
});

export const flashcardMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('createCard', {
			type: 'FlashCard',
			args: {
				question: nonNull(stringArg()),
				answer: nonNull(stringArg()),
			},
			async resolve(parent, args, context, info) {
				const { prisma, userId } = context;
				const { question, answer } = args;

				if (!userId) {
					throw new Error('Please login first');
				}

				const card = await prisma.flashCard.create({
					data: {
						question,
						answer,
						author: { connect: { id: userId } },
					},
				});

				return card;
			},
		});
		t.nonNull.field('updateCard', {
			type: 'FlashCard',
			args: {
				id: nonNull(intArg()),
				question: stringArg(),
				answer: stringArg(),
			},
			async resolve(parent, args, context, info) {
				const { prisma, userId } = context;
				const { id, question, answer } = args;

				if (!userId) {
					throw new Error('Not logged in. Please login !!!!!!!!!!');
				}

				const author = await prisma.flashCard.findFirst({ where: { id } }).author();

				if (author?.id !== userId) {
					throw new Error("Can't update a card you didn't create");
				}

				const card = await prisma.flashCard.update({
					where: { id },
					data: {
						question: question as Prisma.StringFieldUpdateOperationsInput | undefined,
						answer: answer as Prisma.StringFieldUpdateOperationsInput | undefined,
					},
				});

				return card;
			},
		});
		t.nonNull.field('deleteCard', {
			type: 'FlashCard',
			args: {
				id: nonNull(intArg()),
			},
			async resolve(_, args, context, info) {
				const { prisma, userId } = context;
				const { id } = args;

				if (!userId) {
					throw new Error('Not logged in. Please login !!!!!!!!!!');
				}

				const author = await prisma.flashCard.findFirst({ where: { id } }).author();

				if (!author) {
					throw new Error("Card does'nt exist");
				}

				if (author && author.id !== userId) {
					throw new Error("Can't delete a card you didn't create");
				}

				const card = prisma.flashCard.delete({ where: { id } });

				return card;
			},
		});
		t.nonNull.field('readCard', {
			type: 'FlashCard',
			args: {
				id: nonNull(intArg()),
				confidence: nonNull(intArg()),
			},
			async resolve(_, args, context, info) {
				const { prisma, userId } = context;
				const { id, confidence } = args;

				if (!userId) {
					throw new Error('Not logged in. Please login !!!!!!!!!!');
				}

				const author = await prisma.flashCard.findFirst({ where: { id } }).author();

				if (!author) {
					throw new Error("Card does'nt exist");
				}

				if (author.id === userId) {
					throw new Error("Can't read a card you created");
				}

				const card = await prisma.flashCard.update({
					where: { id },
					data: {
						usersRead: {
							create: {
								user: { connect: { id: userId } },
								confidence,
							},
						},
					},
					include: {
						usersRead: true,
						author: true,
					},
				});

				return card;
			},
		});
	},
});
