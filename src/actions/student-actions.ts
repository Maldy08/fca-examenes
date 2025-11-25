"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logWarningAction(attemptId: string) {
    try {
        await db.examAttempt.update({
            where: { id: attemptId },
            data: {
                warnings: {
                    increment: 1
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error logging warning:", error);
        return { success: false };
    }
}
