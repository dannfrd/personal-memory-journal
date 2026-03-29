import { Memory } from "@/src/types";
import { MemoryCard } from "./MemoryCard";

export function MemoryGrid({ memories }: { memories: Memory[] }) {
  return (
    <div className="flex flex-col w-full">
      {memories.map((memory, index) => (
        <MemoryCard key={memory.id} memory={memory} index={index} />
      ))}
    </div>
  );
}
