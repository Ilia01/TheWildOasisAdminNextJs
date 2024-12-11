import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

// const initialUsers: Prisma.UserCreateInput[] = [
//   {
//     id: "wfahsfiwufaiwufhfk23432423r3tedse363",
//     name: "Alice",
//     email: "alice@prisma.io",
//   },
//   {
//     id: "wfahsfiwufaiwufhwdfafk23432423r3tedse363",
//     email: "bob@prisma.io",
//     name: "Bob",
//   },
// ];

async function main() {
  const password = await hash("test", 12);
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      id: "wfahsfiwufaiwdafawfwufhfk23432423r3tedse363",
      email: "alice@prisma.io",
      name: "Alice",
      password,
    },
  });
  // const bob = await prisma.user.upsert({
  //   where: { email: "bob@prisma.io" },
  //   update: {},
  //   create: {
  //     email: "bob@prisma.io",
  //     name: "Bob",
  //   },
  // });

  // console.log(`start seeding ...`);

  // for (const user of initialUsers) {
  //   const newUser = await prisma.user.create({
  //     data: user,
  //   });
  //   console.log(`created user with email: ${newUser.email}`);
  // }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });