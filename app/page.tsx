"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface Data {
  id: number;
  name: string;
  events: number;
}

export default function Countries() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      const { data, error } = await supabase.from("relationships").select("*");
      if (!error) setData(data);
      setLoading(false);
    }
    loadCountries();
  }, []);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Monitored Relationships</h1>

      {/* ✅ FIRST: Show the countries list */}
      {data.map((item) => (
        <Link key={item.id} href={`/${item.id}`}>
          <div className="bg-[#1E293B] p-4 rounded-lg mb-3 cursor-pointer hover:bg-[#243447]">
            <div className="flex justify-between">
              <span className="text-lg">{item.name}</span>
              <span className="text-sm opacity-60">{item.events} events</span>
            </div>
          </div>
        </Link>
      ))}

      {/* ✅ THEN: Place Quick Statistics BELOW */}
      <div className="mt-10 bg-[#1B263B] p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Quick Statistics</h3>

        <div className="space-y-4">
          <div className="bg-[#2E3A4F] p-4 rounded-md">
            <p className="text-3xl font-bold">{data.length}</p>
            <p className="text-sm text-gray-300">Monitored Relationships</p>
          </div>

          <div className="bg-[#2E3A4F] p-4 rounded-md">
            <p className="text-3xl font-bold text-red-400">
              {data.filter((d) => d.events > 15).length}
            </p>
            <p className="text-sm text-gray-300">Critical Threats</p>
          </div>

          <div className="bg-[#2E3A4F] p-4 rounded-md">
            <p className="text-3xl font-bold text-yellow-400">
              {data.filter((d) => d.events >= 8 && d.events <= 15).length}
            </p>
            <p className="text-sm text-gray-300">Moderate Concerns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
