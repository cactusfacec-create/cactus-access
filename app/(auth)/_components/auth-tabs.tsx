"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthTabs({ active }: { active: "ingresar" | "registrarse" }) {
  const router = useRouter();

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        router.push(value === "ingresar" ? "/login" : "/registro");
      }}
    >
      <TabsList className="h-10 w-full">
        <TabsTrigger value="ingresar" className="flex-1">
          Ingresar
        </TabsTrigger>
        <TabsTrigger value="registrarse" className="flex-1">
          Registrarse
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
