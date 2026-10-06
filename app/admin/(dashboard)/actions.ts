"use server";

import { redirect } from "next/navigation";

import { destroyAdminSession } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
