"use client";
import { api } from "@/trpc/react";

export default function Home() {
    const { data } = api.helloWorld.helloWorld.useQuery();
    return <main>{data}</main>;
}
