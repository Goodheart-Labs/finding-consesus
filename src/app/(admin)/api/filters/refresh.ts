import { revalidatePath } from "next/cache";

export const refreshFilter = () => {
  revalidatePath("/");
  revalidatePath("/admin/settings");
};
