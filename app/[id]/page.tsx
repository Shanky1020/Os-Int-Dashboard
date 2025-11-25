"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

const tabs = ["Overview", "DIME", "Economic", "Impact", "Recommendations"];
interface Country{
name:string
}
interface Metric{
id:number,
metric:string,
value:number
}
export default function CountryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Overview");

  const [metrics, setMetrics] = useState<Metric[]>([]);
 const [country, setCountry] = useState<Country | null>(null);

  useEffect(() => {
    async function loadDetails() {
      const { data: rel } = await supabase
        .from("relationships")
        .select("*")
        .eq("id", id)
        .single();

      setCountry(rel);

      const { data: stats } = await supabase
        .from("relationship_stats")
        .select("*")
        .eq("relationship_id", id);

      setMetrics(stats ?? []);
    }

    loadDetails();
  }, [id]);

  if (!country) return <p className="text-white">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{country.name}</h2>

      <div className="flex gap-3 mb-6 border-b border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <MetricBox key={metric.id} label={metric.metric} count={metric.value} />
          ))}
          
        </div>
      )}
    </div>
  );
}
function MetricBox({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-[#1E293B] p-6 text-center rounded-lg">
      <div className="text-4xl font-bold">{count}</div>
      <div className="text-sm opacity-60">{label} Events</div>
    </div>
  );
}
