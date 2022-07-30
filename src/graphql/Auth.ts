import { Prisma, PrismaClient } from "@prisma/client";
import { extendType, nonNull, objectType, stringArg } from "nexus";
import { hashPassword, signToken, verifyPassword } from "../utils/auth.util";
import { userValidation } from "../validations/user.validations";

export const AuthResponse = objectType({
  name: "AuthResponse",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", { type: "User" });
  },
});

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "AuthResponse",
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      // @ts-ignore
      async resolve(parent, args, context) {
        const { prisma }: { prisma: PrismaClient } = context;
        const {
          name,
          email,
          password,
        }: { name: string; email: string; password: string } = args;

        try {
          userValidation({ name, email, password });
        } catch ({ message }) {
          throw new Error(JSON.stringify(message));
        }

        if ((await prisma.user.findMany({ where: { email } })).length !== 0) {
          throw new Error(`A user with email ${email} already exists !!!`);
        }

        const hashedPassword = hashPassword(password);

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
        const token = signToken({ userId: user.id });

        return {
          token,
          user,
        };
      },
    });
    t.nonNull.field("login", {
      type: "AuthResponse",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      // @ts-ignore
      async resolve(_, args, context) {
        const { prisma } = context;
        const { email, password } = args;

        const user = await prisma.user.findFirst({
          where: { email },
          include: { flashcardsRead: true, flashcardsCreated: true },
        });

        if (!user) {
          throw new Error(`No user with email ${email} exist !!!!!!`);
        }

        if (!verifyPassword(password, user.password)) {
          throw new Error(`Invalid credentials`);
        }

        const token = signToken({ userId: user.id });

        return {
          user,
          token,
        };
      },
    });
  },
});
