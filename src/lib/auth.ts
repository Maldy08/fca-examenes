import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCurrentDbUser() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  return db.user.findUnique({
    where: { email },
  });
}

export async function requireAdminUser() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  return dbUser;
}
