export const metadata = {
  title: "Settings",
  description: "Manage account and website settings",
};

import UserNameForm from "@/components/UserNameForm";
import { authOptions, getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page = async ({}) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages?.signIn || "/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid items-start gap-8">
        <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>
        <div className="grid gap-10">
          <UserNameForm
            user={{
              // @ts-expect-error
              id: session.user.id,
              // @ts-expect-error
              username: session.user.username || "",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
