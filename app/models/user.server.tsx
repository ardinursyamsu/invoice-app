import { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createUser(user: Pick<User, "id" | "name" | "type">) {
  return prisma.user.create({ data: user });
}

export async function getUsers() {
  return prisma.user.findMany();
}
