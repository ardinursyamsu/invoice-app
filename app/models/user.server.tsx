import { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createUser(user: Pick<User, "id" | "name" | "type">) {
  return prisma.user.create({ data: user });
}

export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUserById(userId: string) {
  return prisma.user.findFirst({ where: { id: userId } });
}

export async function getUserByType(type: string) {
  return prisma.user.findMany({ where: { type: type } });
}
